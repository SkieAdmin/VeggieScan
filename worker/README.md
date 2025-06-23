# VeggieScan Worker Client

This is a worker client for the VeggieScan system that connects to the VeggieScan backend via WebSocket and processes vegetable image analysis tasks using LM Studio.

## Requirements

- .NET 6.0 SDK or later
- LM Studio running locally or on a remote server
- Windows operating system (for hardware detection)

## Building the Worker

```bash
dotnet build
```

## Running the Worker

```bash
dotnet run
```

### Command Line Arguments

- `--ws-url`: WebSocket server URL (default: ws://localhost:3002)
- `--lm-studio-url`: LM Studio API URL (default: http://localhost:1234)

Example:
```bash
dotnet run -- --ws-url ws://192.168.1.100:3002 --lm-studio-url http://localhost:1234
```

## How It Works

1. The worker connects to the VeggieScan backend WebSocket server
2. It sends its hardware capabilities (CPU, GPU, RAM) and LM Studio availability
3. The server distributes vegetable image analysis tasks to connected workers
4. The worker processes the tasks using LM Studio and returns the results to the server

## Features

- Automatic reconnection if the WebSocket connection is lost
- Hardware detection for CPU, GPU, and RAM information
- LM Studio integration for vegetable image analysis
- Task progress reporting
- Error handling and fallback mechanisms

## System Requirements

For optimal performance, the following specifications are recommended:

- CPU: Intel Core i5/AMD Ryzen 5 or better
- GPU: NVIDIA GTX 1650 or better (for faster image processing)
- RAM: 8GB or more
- Storage: 1GB free space for the application and dependencies

## Troubleshooting

If you encounter issues:

1. Make sure LM Studio is running and accessible
2. Check that the WebSocket server URL is correct
3. Verify that the required models are available in LM Studio
4. Check the console output for error messages
