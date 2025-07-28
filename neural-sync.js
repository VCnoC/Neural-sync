class NeuralSync {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.nodes = [];
        this.connections = [];
        this.pulses = [];
        this.time = 0;
        
        this.config = {
            nodeCount: 80,
            connectionDistance: 100,
            syncStrength: 1.0,
            animationSpeed: 1.0,
            nodeSize: 4,
            pulseSpeed: 3
        };
        
        this.colors = {
            node: '#00ffff',
            nodeActive: '#ff0080',
            connection: 'rgba(0, 255, 255, 0.3)',
            connectionActive: 'rgba(255, 0, 128, 0.6)',
            pulse: 'rgba(255, 255, 255, 0.8)',
            background: 'rgba(0, 0, 0, 0.1)'
        };
        
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.createNodes();
        this.setupEventListeners();
        this.animate();
    }
    
    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
    }
    
    createNodes() {
        this.nodes = [];
        for (let i = 0; i < this.config.nodeCount; i++) {
            this.nodes.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                phase: Math.random() * Math.PI * 2,
                frequency: 0.02 + Math.random() * 0.03,
                amplitude: 0.5 + Math.random() * 0.5,
                activity: 0,
                connections: [],
                id: i
            });
        }
        this.updateConnections();
    }
    
    updateConnections() {
        this.connections = [];
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                const dx = this.nodes[i].x - this.nodes[j].x;
                const dy = this.nodes[i].y - this.nodes[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.config.connectionDistance) {
                    this.connections.push({
                        from: this.nodes[i],
                        to: this.nodes[j],
                        distance: distance,
                        strength: 1 - (distance / this.config.connectionDistance)
                    });
                }
            }
        }
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.addNode(x, y);
        });
        
        document.getElementById('nodeCount').addEventListener('input', (e) => {
            this.config.nodeCount = parseInt(e.target.value);
            document.getElementById('nodeCountValue').textContent = e.target.value;
            this.createNodes();
        });
        
        document.getElementById('connectionDistance').addEventListener('input', (e) => {
            this.config.connectionDistance = parseInt(e.target.value);
            document.getElementById('connectionDistanceValue').textContent = e.target.value;
            this.updateConnections();
        });
        
        document.getElementById('syncStrength').addEventListener('input', (e) => {
            this.config.syncStrength = parseFloat(e.target.value);
            document.getElementById('syncStrengthValue').textContent = e.target.value;
        });
        
        document.getElementById('animationSpeed').addEventListener('input', (e) => {
            this.config.animationSpeed = parseFloat(e.target.value);
            document.getElementById('animationSpeedValue').textContent = e.target.value;
        });
        
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.createNodes();
        });
        
        document.getElementById('pulseBtn').addEventListener('click', () => {
            this.sendPulse();
        });
    }
    
    addNode(x, y) {
        this.nodes.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            phase: Math.random() * Math.PI * 2,
            frequency: 0.02 + Math.random() * 0.03,
            amplitude: 0.5 + Math.random() * 0.5,
            activity: 1,
            connections: [],
            id: this.nodes.length
        });
        this.updateConnections();
    }
    
    sendPulse() {
        if (this.nodes.length > 0) {
            const randomNode = this.nodes[Math.floor(Math.random() * this.nodes.length)];
            this.pulses.push({
                x: randomNode.x,
                y: randomNode.y,
                radius: 0,
                maxRadius: this.config.connectionDistance * 2,
                alpha: 1
            });
        }
    }
    
    update() {
        this.time += 0.016 * this.config.animationSpeed;
        
        for (let node of this.nodes) {
            node.phase += node.frequency * this.config.animationSpeed;
            node.activity = (Math.sin(node.phase) + 1) * 0.5 * node.amplitude;
            
            node.x += node.vx * this.config.animationSpeed;
            node.y += node.vy * this.config.animationSpeed;
            
            if (node.x < 0 || node.x > this.canvas.width) node.vx *= -1;
            if (node.y < 0 || node.y > this.canvas.height) node.vy *= -1;
            
            node.x = Math.max(0, Math.min(this.canvas.width, node.x));
            node.y = Math.max(0, Math.min(this.canvas.height, node.y));
        }
        
        this.updateConnections();
        
        for (let i = this.pulses.length - 1; i >= 0; i--) {
            const pulse = this.pulses[i];
            pulse.radius += this.config.pulseSpeed * this.config.animationSpeed;
            pulse.alpha = 1 - (pulse.radius / pulse.maxRadius);
            
            if (pulse.radius > pulse.maxRadius) {
                this.pulses.splice(i, 1);
            }
        }
    }
    
    draw() {
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let connection of this.connections) {
            const avgActivity = (connection.from.activity + connection.to.activity) * 0.5;
            const alpha = connection.strength * avgActivity * this.config.syncStrength;
            
            this.ctx.beginPath();
            this.ctx.moveTo(connection.from.x, connection.from.y);
            this.ctx.lineTo(connection.to.x, connection.to.y);
            this.ctx.strokeStyle = `rgba(0, 255, 255, ${alpha})`;
            this.ctx.lineWidth = 1 + avgActivity * 2;
            this.ctx.stroke();
        }
        
        for (let node of this.nodes) {
            const gradient = this.ctx.createRadialGradient(
                node.x, node.y, 0,
                node.x, node.y, this.config.nodeSize + node.activity * 4
            );
            
            if (node.activity > 0.7) {
                gradient.addColorStop(0, 'rgba(255, 0, 128, 1)');
                gradient.addColorStop(1, 'rgba(255, 0, 128, 0)');
            } else {
                gradient.addColorStop(0, 'rgba(0, 255, 255, 1)');
                gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
            }
            
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, this.config.nodeSize + node.activity * 4, 0, Math.PI * 2);
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
        }
        
        for (let pulse of this.pulses) {
            this.ctx.beginPath();
            this.ctx.arc(pulse.x, pulse.y, pulse.radius, 0, Math.PI * 2);
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${pulse.alpha})`;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
    }
    
    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

window.addEventListener('load', () => {
    new NeuralSync();
});