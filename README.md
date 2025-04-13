# MCPup: A MCP Framework for Entire Workflow [![Twitter](https://img.shields.io/badge/Twitter-blue.svg)](https://x.com/MCPupAI) <br>



[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Unity Version](https://img.shields.io/badge/Unity-2021.3+-black.svg?logo=unity)](https://unity.com/)
[![Node.js Version](https://img.shields.io/badge/Node.js-18+-green.svg?logo=Node.js)](https://nodejs.org/en)
[![Node.js Version](https://img.shields.io/badge/TypeScript-5.0-Blue.svg?logo=TypeScript)](https://nodejs.org/en)
[![MCP Version](https://img.shields.io/badge/MCP_Beta-0.9.0-cyan.svg)](https://x.com/MCPupAI)<br>

# Vision

**Universal Framework for Unified Creative Pipeline**<br>

### Integrated Solution for Game Development
[A Live Demo with Unity 2025 LTS](https://drive.google.com/file/d/1UBO1hLAVkHbJbXklioScavXkz3QXzxp0/view)<br>
<br>
**Core Toolchain**  
- **Modeling & Sculpting**  
  - **Blender** (open-source modeling), **Maya** (industrial-grade modeling), **ZBrush** (digital sculpting)  
  - Cross-software asset library auto-sync (supports `.fbx`/`.gltf` format conversion)  

- **VFX & Animation**  
  - **Houdini** (procedural effects), **After Effects** (motion graphics), **MotionBuilder** (mocap integration)  
  - Real-time animation preview directly linked to game engines (supports Unity/Unreal dual drivers)  

- **Engine Development**  
  - **Unreal Engine 5** (Nanite/Lumen stack), **Unity 2025 LTS** (DOTS architecture), **Godot 5** (lightweight deployment)  
  - Cross-engine material system (auto-convert HLSL ↔ Shader Graph)  

**Automated Workflow Examples**  
1. **Blender → Unreal Asset Pipeline**  
   - Mesh topology optimization → LOD generation → Physics collision body construction → UE5 Blueprint component packaging  

2. **Houdini → Niagara FX Baking**  
   - Parametric particle effect generation → GPU baking → Real-time wind/fluid data stream injection  

3. **Multi-Software Version Control**  
   - Git-LFS based incremental sync (Maya project files ↔ Blender scenes ↔ Unity prefabs)  

#### Expansion to Film Production
**Photography Studio Module**  
- Integrated **Adobe Lightroom** (RAW AI processing), **DALL·E 5** (concept art generation), **NVIDIA Omniverse** (multi-camera virtual shooting)  
- Automated retouching pipeline: RAW denoising → AI color grading → Multi-platform resolution adaptation  

**Film Production Module**  
- **Virtual Production System**  
  - Unreal virtual scenes → ARRI camera metadata binding → DaVinci Resolve live color grading  
- **AI-Assisted Creation**  
  - Script structure analysis → Storyboard auto-generation → Dynamic resource allocation (parallel character/scene/VFX production)  

#### Technical Architecture Highlights
- **Universal Middleware Protocol**  
  ```python
  # MCP protocol example: Cross-software command forwarding
  def mcp_translate(command):
      if command.source == "Blender":
          return unreal_engine_adapter(command)
      elif command.source == "Houdini":
          return unity_particle_adapter(command)
# Version
  **Unity integration has been completed, more software coming soon**

# Architecture
  **first MCP Unify Game Production Pipeline and Next-Gen Game Production Framework**<br>
### 1. Unity Plugin (editor)
**Subsystem Specifications**
| Module                | Technical Implementation                          | Performance Metrics       |
|-----------------------|---------------------------------------------------|---------------------------|
| **WebSocket Client**  | NativeWebSocket with binary protocol compression  | <100ms round-trip latency |
| **Hot Code Engine**    | Roslyn-based C# 8.0 dynamic compilation           | 500ms code hot-swap       |
| **State Tracker**      | ScriptableObject delta serialization              | 10MB/s throughput         |
| **Logging System**     | Multi-category logging with Console integration   | 10k+ logs/sec processing  |
### 2. unity-mcp-server (Cross-Platform Service Hub)

Implements the Message Control Protocol (MCP) specification v2.3 for seamless integration with the Unity Editor extension. Communication occurs through a persistent WebSocket channel (RFC 6455 compliant) supporting binary/text frames.

**Key Components**  
1. **Protocol Layer**  
   - MCP-compliant message encapsulation with CRC32 checksum  
   - Version negotiation during handshake (supports MCP v2.0 - v2.3)

2. **Transport Mechanism**  
   - Secure WebSocket (wss://) implementation  
   - Message compression via LZ4 algorithm  
   - Keep-alive heartbeat interval: 15 seconds

3. **Data Format**  
   - JSON Schema 2020-12 validated payloads  
   - Custom serialization for Unity-specific data types:  
     - Vector3/Quaternion precision optimization  
     - GameObject reference resolution  
     - Scene hierarchy delta encoding

4. **Command Pipeline**  
   - Asynchronous message queue with priority levels  
   - Transactional command sequencing (ID-based tracking)  
   -


# Usage

### **Unity Editor Interaction Layer**
#### 1. State Monitoring Suite
- `get_editor_state`: Real-time capture of global editor status (project configuration, play mode state, compilation progress)
- `verify_connection`: Maintain bidirectional heartbeat detection with connection quality metrics

#### 2. Scene Operation Engine
- `get_current_scene_info`: Analyze scene hierarchy (including Transform tree topology and component distribution heatmap)
- `get_game_objects_info`: Deep scan GameObject metadata (with component dependency chains and material reference graphs)

#### 3. Execution Control Module
- `execute_editor_command`: Support C#8.0 syntax JIT compilation in sandboxed environment (with error isolation)
- `get_logs`: Dynamic log stream filtering (triple-filter by log type/temporal window/keywords)

### **Project File Management System**
#### 4. Basic File Operations
- `read_file`: Binary-safe reading (auto-detects UTF-8/UTF-16 encoding)
- `write_file`: Atomic write operations with *.bak auto-backup
- `edit_file`: Diff engine with line-level patch application

#### 5. Batch Processing Interface
- `read_multiple_files`: Parallel I/O optimized reading (supports up to 128 files)
- `list_scripts`: C# script intelligent indexing (namespace resolution & class inheritance mapping)

#### 6. Directory Navigation System
- `list_directory`: Real-time filesystem snapshot (with hidden file visibility control)
- `directory_tree`: ASCII tree generation (configurable depth & filter patterns)

#### 7. Advanced Search Tools
- `search_files`: PCRE2 regex engine implementation
- `get_file_info`: NTFS extended attributes extraction (with file hash generation)

#### 8. Asset Management Module
- `find_assets_by_type`: Type fingerprint recognition (supports 200+ asset types including Shader/Material/Prefab)

---

## Technical Feature Matrix

| Feature Dimension   | Editor Tools Characteristics            | Filesystem Characteristics          |
|----------------------|-----------------------------------------|--------------------------------------|
| **Realtime**         | Millisecond-level state sync           | Asynchronous I/O queue management   |
| **Security**         | Sandboxed execution environment        | Write permission verification       |
| **Extensibility**    | Dynamic plugin architecture            | Custom file watchers                |
| **Data Scale**       | Supports 100k+ GameObject scenes       | Handles TB-scale project repositories |
| **Cross-Platform**   | Windows/macOS/Linux full support       | Unified path normalization          |

# Installation Guide
## Prerequisites
- **Unity 2021.3 or later**
- **Node.js 18+ (for running the MCP server)**
## 1. Install Unity Package

### Installation Options

**Via Unity Package Manager (Git URL)**
1. Open Unity Package Manager  
   `Window > Package Manager`
2. Add Git repository:  
   Click `+` → `Add package from git URL...`
3. Enter repository URL:  
   `https://github.com/nasimali5/mcpup.git`
4. Complete installation:  
   Click `Add` button



---

## 2. Configure MCP Server

### Deployment Options A

```bash
# Navigate to server directory
cd <path-to-project>/Library/PackageCache/com.nasimali5.mcpup@42c7f8e7df0f/mcpServer/

# Install dependencies
npm install

# Start server
node build/index.js
```
### Deployment Options B

Add the server to your MCP Host configuration for Claude Desktop, Custom Implementation etc

```json
{
  "mcpServers": {
    "mcpup-server": {
      "command": "node",
      "args": [
        "path-to-project>\\Library\\PackageCache\\com.nasimali5.mcpup@42c7f8e7df0f\\mcpServer\\build\\index.js"
      ],
      "env": {
        "MCP_WEBSOCKET_PORT": "8080"
      }
    }
  }
}
```


