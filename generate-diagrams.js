const fs = require('fs');
const { createCanvas } = require('canvas');
const path = require('path');

// Create ERD Diagram
function generateERD() {
    const canvas = createCanvas(1200, 800);
    const ctx = canvas.getContext('2d');
    
    // Set background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Title
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.fillText('VeggieScan - Entity Relationship Diagram', canvas.width / 2, 40);
    
    // Draw entities
    drawEntity(ctx, 200, 150, 250, 220, 'User', [
        'id: Int (PK)',
        'email: String (unique)',
        'password: String',
        'name: String',
        'role: Role (enum)',
        'createdAt: DateTime',
        'updatedAt: DateTime'
    ]);
    
    drawEntity(ctx, 200, 450, 250, 160, 'Settings', [
        'id: Int (PK)',
        'userId: Int (FK)',
        'notificationsOn: Boolean',
        'darkModeEnabled: Boolean',
        'languagePreference: String'
    ]);
    
    drawEntity(ctx, 650, 150, 250, 220, 'Scan', [
        'id: Int (PK)',
        'userId: Int (FK)',
        'vegetableName: String',
        'isSafe: Boolean',
        'diseaseName: String?',
        'recommendation: Text',
        'imagePath: String',
        'createdAt: DateTime'
    ]);
    
    drawEntity(ctx, 650, 450, 250, 180, 'Dataset', [
        'id: Int (PK)',
        'vegetableName: String',
        'isSafe: Boolean',
        'diseaseName: String?',
        'recommendation: Text',
        'imagePath: String?',
        'createdAt: DateTime'
    ]);
    
    // Draw relationships
    drawRelationship(ctx, 325, 220, 650, 220, '1', '*', 'has');
    drawRelationship(ctx, 200, 260, 200, 450, '1', '1', 'has');
    
    // Save to file
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(__dirname, 'ERD.png'), buffer);
    console.log('ERD diagram saved as ERD.png');
}

// Create DFD Diagram
function generateDFD() {
    const canvas = createCanvas(1200, 800);
    const ctx = canvas.getContext('2d');
    
    // Set background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Title
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.fillText('VeggieScan - Data Flow Diagram', canvas.width / 2, 40);
    
    // Draw processes
    drawProcess(ctx, 600, 200, 150, 'Vegetable Analysis Process');
    drawProcess(ctx, 300, 350, 150, 'User Authentication');
    drawProcess(ctx, 600, 500, 150, 'Scan History Management');
    drawProcess(ctx, 900, 350, 150, 'Dataset Management');
    
    // Draw external entities
    drawExternalEntity(ctx, 150, 200, 'User');
    drawExternalEntity(ctx, 1050, 200, 'LM Studio');
    drawExternalEntity(ctx, 600, 650, 'WebSocket Worker');
    
    // Draw data stores
    drawDataStore(ctx, 300, 500, 'User Database');
    drawDataStore(ctx, 900, 500, 'Vegetable Dataset');
    
    // Draw data flows
    drawDataFlow(ctx, 150, 200, 300, 350, 'Login Credentials');
    drawDataFlow(ctx, 300, 350, 300, 500, 'User Data');
    drawDataFlow(ctx, 150, 200, 600, 200, 'Vegetable Image');
    drawDataFlow(ctx, 600, 200, 1050, 200, 'Image Analysis Request');
    drawDataFlow(ctx, 1050, 200, 600, 200, 'Analysis Results');
    drawDataFlow(ctx, 600, 200, 600, 500, 'Scan Results');
    drawDataFlow(ctx, 600, 500, 900, 500, 'Update Dataset');
    drawDataFlow(ctx, 600, 200, 600, 650, 'WebSocket Tasks');
    drawDataFlow(ctx, 600, 650, 600, 200, 'Task Results');
    drawDataFlow(ctx, 600, 500, 150, 200, 'Scan History');
    
    // Save to file
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(__dirname, 'DFD.png'), buffer);
    console.log('DFD diagram saved as DFD.png');
}

// Helper functions
function drawEntity(ctx, x, y, width, height, name, attributes) {
    // Draw entity box
    ctx.fillStyle = '#b3d9ff';
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    
    // Draw entity name
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(name, x + width / 2, y + 25);
    
    // Draw separator line
    ctx.beginPath();
    ctx.moveTo(x, y + 40);
    ctx.lineTo(x + width, y + 40);
    ctx.stroke();
    
    // Draw attributes
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    attributes.forEach((attr, index) => {
        ctx.fillText(attr, x + 10, y + 65 + (index * 20));
    });
}

function drawProcess(ctx, x, y, radius, name) {
    // Draw process circle
    ctx.fillStyle = '#ffcccc';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw process name
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    
    // Handle multi-line text
    const words = name.split(' ');
    let line = '';
    let lines = [];
    words.forEach(word => {
        const testLine = line + word + ' ';
        if (testLine.length > 15) {
            lines.push(line);
            line = word + ' ';
        } else {
            line = testLine;
        }
    });
    lines.push(line);
    
    lines.forEach((l, i) => {
        ctx.fillText(l, x, y - 5 + (i * 20));
    });
}

function drawExternalEntity(ctx, x, y, name) {
    // Draw external entity square
    ctx.fillStyle = '#d9f2d9';
    ctx.fillRect(x - 60, y - 30, 120, 60);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 60, y - 30, 120, 60);
    
    // Draw name
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(name, x, y + 5);
}

function drawDataStore(ctx, x, y, name) {
    // Draw data store
    ctx.fillStyle = '#ffffcc';
    ctx.fillRect(x - 100, y - 30, 200, 60);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 100, y - 30, 200, 60);
    
    // Draw name
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(name, x, y + 5);
}

function drawDataFlow(ctx, x1, y1, x2, y2, label) {
    // Draw arrow
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    
    // Draw arrowhead
    const angle = Math.atan2(y2 - y1, x2 - x1);
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 10 * Math.cos(angle - Math.PI / 6), y2 - 10 * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x2 - 10 * Math.cos(angle + Math.PI / 6), y2 - 10 * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
    
    // Draw label
    ctx.fillStyle = '#000000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    ctx.fillText(label, midX, midY - 5);
}

function drawRelationship(ctx, x1, y1, x2, y2, card1, card2, label) {
    // Draw line
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    
    // Draw cardinality
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    
    // Calculate positions for cardinality labels
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const dist = 20;
    
    // First cardinality
    ctx.fillText(card1, x1 + dist * Math.cos(angle), y1 + dist * Math.sin(angle));
    
    // Second cardinality
    ctx.fillText(card2, x2 - dist * Math.cos(angle), y2 - dist * Math.sin(angle));
    
    // Relationship label
    ctx.font = '14px Arial';
    ctx.fillText(label, (x1 + x2) / 2, (y1 + y2) / 2 - 10);
}

// Generate both diagrams
generateERD();
generateDFD();
