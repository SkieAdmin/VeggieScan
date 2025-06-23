using System;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using WebSocketSharp;
using System.Management;
using System.Net.Http;

namespace VeggieScanWorker
{
    class Program
    {
        private static WebSocket _ws;
        private static string _clientId;
        private static readonly HttpClient _httpClient = new HttpClient();
        private static LMStudioService _lmStudioService;
        private static readonly string _lmStudioBaseUrl = "http://localhost:1234"; // Default LM Studio URL
        private static readonly string _wsServerUrl = "ws://localhost:3002"; // Default WebSocket server URL
        private static bool _running = true;

        static async Task Main(string[] args)
        {
            Console.WriteLine("VeggieScan Worker Client");
            Console.WriteLine("========================");

            // Parse command line arguments
            string wsUrl = _wsServerUrl;
            string lmStudioUrl = _lmStudioBaseUrl;

            for (int i = 0; i < args.Length; i++)
            {
                if (args[i] == "--ws-url" && i + 1 < args.Length)
                {
                    wsUrl = args[i + 1];
                    i++;
                }
                else if (args[i] == "--lm-studio-url" && i + 1 < args.Length)
                {
                    lmStudioUrl = args[i + 1];
                    i++;
                }
            }

            Console.WriteLine($"WebSocket Server URL: {wsUrl}");
            Console.WriteLine($"LM Studio URL: {lmStudioUrl}");

            // Initialize LM Studio service
            _lmStudioService = new LMStudioService(lmStudioUrl);
            
            // Check if LM Studio is available
            bool lmStudioAvailable = await _lmStudioService.IsAvailable();
            Console.WriteLine($"LM Studio available: {lmStudioAvailable}");

            if (!lmStudioAvailable)
            {
                Console.WriteLine("LM Studio is not available. Please make sure it's running.");
                Console.WriteLine("Press any key to exit...");
                Console.ReadKey();
                return;
            }

            // Get available models
            var models = await _lmStudioService.GetAvailableModels();
            Console.WriteLine($"Available models: {string.Join(", ", models)}");

            // Connect to WebSocket server
            ConnectToWebSocketServer(wsUrl);

            // Keep the application running
            Console.WriteLine("Press Ctrl+C to exit");
            Console.CancelKeyPress += (sender, e) => 
            {
                e.Cancel = true;
                _running = false;
                _ws?.Close();
                Console.WriteLine("Shutting down...");
            };

            while (_running)
            {
                await Task.Delay(1000);
            }
        }

        private static void ConnectToWebSocketServer(string url)
        {
            _ws = new WebSocket(url);

            _ws.OnOpen += (sender, e) =>
            {
                Console.WriteLine("Connected to WebSocket server");
            };

            _ws.OnMessage += async (sender, e) =>
            {
                try
                {
                    var message = JsonConvert.DeserializeObject<JObject>(e.Data);
                    string messageType = message["type"].ToString();

                    Console.WriteLine($"Received message: {messageType}");

                    switch (messageType)
                    {
                        case "welcome":
                            _clientId = message["clientId"].ToString();
                            Console.WriteLine($"Received client ID: {_clientId}");
                            SendCapabilities();
                            break;

                        case "capabilities_ack":
                            Console.WriteLine("Capabilities acknowledged by server");
                            break;

                        case "ping":
                            SendPong();
                            break;

                        case "task":
                            await HandleTask(message);
                            break;

                        case "client_list":
                            HandleClientList(message);
                            break;
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error processing message: {ex.Message}");
                }
            };

            _ws.OnError += (sender, e) =>
            {
                Console.WriteLine($"WebSocket error: {e.Message}");
            };

            _ws.OnClose += (sender, e) =>
            {
                Console.WriteLine($"WebSocket closed: {e.Code} {e.Reason}");
                
                if (_running)
                {
                    Console.WriteLine("Attempting to reconnect in 5 seconds...");
                    Task.Delay(5000).ContinueWith(_ => 
                    {
                        if (_running)
                        {
                            ConnectToWebSocketServer(url);
                        }
                    });
                }
            };

            _ws.Connect();
        }

        private static void SendCapabilities()
        {
            var cpuInfo = GetCpuInfo();
            var gpuInfo = GetGpuInfo();
            var ramInfo = GetRamInfo();

            var capabilities = new
            {
                type = "capabilities",
                cpu = cpuInfo,
                gpu = gpuInfo,
                ram = ramInfo,
                hasLMStudio = true,
                models = new[] { "google/gemma-3-4b", "google/gemma-3-27b" } // Example models, should be dynamically fetched
            };

            string json = JsonConvert.SerializeObject(capabilities);
            _ws.Send(json);

            Console.WriteLine("Sent capabilities to server:");
            Console.WriteLine($"  CPU: {cpuInfo}");
            Console.WriteLine($"  GPU: {gpuInfo}");
            Console.WriteLine($"  RAM: {ramInfo}");
        }

        private static void SendPong()
        {
            var pong = new
            {
                type = "pong",
                timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
            };

            string json = JsonConvert.SerializeObject(pong);
            _ws.Send(json);
        }

        private static async Task HandleTask(JObject message)
        {
            string taskId = message["taskId"].ToString();
            string taskType = message["taskType"].ToString();
            JObject data = (JObject)message["data"];

            Console.WriteLine($"Received task: {taskType} (ID: {taskId})");

            // Update status to busy
            SendStatusUpdate("busy", taskId, 0);

            try
            {
                switch (taskType)
                {
                    case "analyze_image":
                        var result = await AnalyzeImage(data);
                        SendTaskResult(taskId, result);
                        break;

                    default:
                        Console.WriteLine($"Unknown task type: {taskType}");
                        SendTaskError(taskId, $"Unknown task type: {taskType}");
                        break;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error processing task: {ex.Message}");
                SendTaskError(taskId, ex.Message);
            }

            // Update status to ready
            SendStatusUpdate("ready", null, 100);
        }

        private static void HandleClientList(JObject message)
        {
            var clients = message["clients"].ToObject<JArray>();
            Console.WriteLine($"Connected clients: {clients.Count}");

            foreach (JObject client in clients)
            {
                string id = client["id"].ToString();
                string status = client["status"].ToString();
                int tasks = client["tasks"].ToObject<int>();

                // Only show details for other clients
                if (id != _clientId)
                {
                    Console.WriteLine($"  Client {id}: {status} ({tasks} active tasks)");
                }
            }
        }

        private static void SendStatusUpdate(string status, string taskId = null, int progress = 0)
        {
            var statusUpdate = new
            {
                type = "status_update",
                status,
                taskProgress = taskId != null ? new { taskId, progress } : null
            };

            string json = JsonConvert.SerializeObject(statusUpdate);
            _ws.Send(json);
        }

        private static void SendTaskResult(string taskId, object result)
        {
            var taskResult = new
            {
                type = "task_result",
                taskId,
                result
            };

            string json = JsonConvert.SerializeObject(taskResult);
            _ws.Send(json);
            Console.WriteLine($"Sent result for task {taskId}");
        }

        private static void SendTaskError(string taskId, string errorMessage)
        {
            var taskError = new
            {
                type = "task_result",
                taskId,
                error = errorMessage
            };

            string json = JsonConvert.SerializeObject(taskError);
            _ws.Send(json);
            Console.WriteLine($"Sent error for task {taskId}: {errorMessage}");
        }

        // LM Studio methods are now in LMStudioService.cs

        private static string GetCpuInfo()
        {
            try
            {
                using (var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_Processor"))
                {
                    foreach (var obj in searcher.Get())
                    {
                        return obj["Name"].ToString();
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting CPU info: {ex.Message}");
            }

            return "Unknown CPU";
        }

        private static string GetGpuInfo()
        {
            try
            {
                using (var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_VideoController"))
                {
                    foreach (var obj in searcher.Get())
                    {
                        return obj["Name"].ToString();
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting GPU info: {ex.Message}");
            }

            return "Unknown GPU";
        }

        private static string GetRamInfo()
        {
            try
            {
                using (var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_ComputerSystem"))
                {
                    foreach (var obj in searcher.Get())
                    {
                        ulong totalMemory = Convert.ToUInt64(obj["TotalPhysicalMemory"]);
                        return $"{totalMemory / (1024 * 1024 * 1024)} GB";
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting RAM info: {ex.Message}");
            }

            return "Unknown RAM";
        }

        private static async Task<object> AnalyzeImage(JObject data)
        {
            try
            {
                Console.WriteLine("Starting image analysis...");
                
                // Extract data from the task
                string base64Image = data["imageBase64"].ToString();
                string prompt = data["prompt"].ToString();
                string model = data["model"]?.ToString() ?? "google/gemma-3-4b";
                
                Console.WriteLine($"Using model: {model}");
                Console.WriteLine("Sending image to LM Studio for analysis...");
                
                // Send progress update
                SendStatusUpdate("busy", null, 25);
                
                // Use LMStudioService to analyze the image
                var result = await _lmStudioService.AnalyzeImage(base64Image, prompt, model);
                
                Console.WriteLine("Analysis complete!");
                Console.WriteLine($"Vegetable: {result.VegetableName}");
                Console.WriteLine($"Safe to eat: {result.SafeToEat}");
                Console.WriteLine($"Disease: {result.DiseaseName ?? "None"}");
                
                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error analyzing image: {ex.Message}");
                throw;
            }
        }
    }
}
