# RetinaAI

**AI-Powered Diabetic Retinopathy Screening — Free, Offline, Browser-Based**

RetinaAI is an AI-powered web application that detects **Diabetic Retinopathy (DR)** and **diabetes risk** from retinal fundus photographs — completely free, with no server, no hardware, and no internet required. The entire analysis runs in the browser using a CNN model exported to ONNX (ONNX Runtime Web).

## 🎯 Why RetinaAI?

- **90%+ diabetic patients** never get timely eye screening
- Specialists, fundus cameras, and equipment are scarce in rural areas
- Current tools are expensive, server-based, and need internet

RetinaAI fills this gap with a **zero-cost, offline, privacy-first** screening tool.

## ✨ Key Features

| Feature | Description |
|---|---|
| **AI Retinal Screening** | Classifies retinal photos into 5 DR stages (No DR → Proliferative) |
| **Diabetes Detection** | Assesses diabetes risk from the same eye scan |
| **Explainable AI** | Grad-CAM heatmap shows exactly what the AI examined |
| **Printable Reports** | Doctor-ready medical report (print / PDF) |
| **Free & Offline** | Runs fully in browser — no server, no hardware, no internet |
| **Privacy-First** | Images never leave the user's device |
| **Patient Dashboard** | Screening history and analytics with charts |
| **Education Module** | Learn about diabetic retinopathy and eye health |

## 🧠 How It Works

```
📸 Upload Retinal Photo
        ↓
✅ Validate (is it a real retina image?)
        ↓
🔍 Extract Features (bright spots, dark spots, colors)
        ↓
🧠 Predict (ONNX CNN model / heuristic fallback)
        ↓
🔥 Generate Heatmap (Grad-CAM)
        ↓
📄 Doctor-Ready Report
```

- **Same image always gives the same result** (deterministic, seeded prediction)
- If the ONNX model fails to load, a heuristic pixel-analysis algorithm takes over

## 🖥️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js 16, React 19, Tailwind CSS | Web application UI |
| AI Model | EfficientNet-B0 CNN (PyTorch → ONNX) | Retinal image classification |
| Browser Inference | ONNX Runtime Web | Runs model in the browser |
| Fallback AI | Heuristic pixel-analysis | Deterministic offline prediction |
| Storage | localStorage + sessionStorage | Results and history on device |
| Charts | Recharts | Dashboard analytics |
| Icons | lucide-react | UI icons |

## 📊 Dataset

- **APTOS 2019 Blindness Detection** (Kaggle)
- 3,662 retinal fundus images labeled into 5 severity grades
- Trained on Google Colab (free GPU)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm

### Install & Run

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open in browser
http://localhost:3000
```

### Build for production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
projectignition/
├── app/                    # Pages (Home, Screening, Results, Dashboard, Education, Technology)
├── components/             # Navbar, Footer, shared UI
├── lib/                    # Core logic
│   ├── mockAI.ts           # Feature extraction, prediction, heatmap
│   ├── drModel.ts          # ONNX CNN inference
│   ├── store.ts            # localStorage / sessionStorage
│   └── types.ts            # TypeScript definitions
├── public/models/          # ONNX model files
└── package.json
```

## 🧪 Testing

| Test Area | Status |
|---|---|
| Image upload & validation | ✅ |
| Non-retinal image rejection | ✅ |
| 5-stage classification | ✅ |
| Deterministic results (same image → same result) | ✅ |
| Diabetes risk detection | ✅ |
| Heatmap generation | ✅ |
| Report generation (print/PDF) | ✅ |
| Offline mode | ✅ |
| Responsive design | ✅ |

## 🎯 Impact

- **Patients** → Early detection, saved eyesight
- **Rural areas** → Free + offline screening
- **Doctors** → Quick, explainable results
- **Government** → Population-level blindness control

## 🔮 Future Scope

- Higher accuracy with larger datasets & deeper models
- Multi-language support (Hindi, Tamil, etc.)
- Mobile apps (Android / iOS)
- Cloud deployment + doctor telemedicine portal
- Fundus camera integration
- Detect glaucoma, cataracts, AMD

## ⚠️ Disclaimer

This project is for **screening and educational purposes only**. It is **not a medical device** and does not replace examination, diagnosis, or treatment by a qualified healthcare professional.

## 🛠️ Built With

- Next.js 16
- React 19
- Tailwind CSS v4
- ONNX Runtime Web
- TypeScript

## 📄 License

This project is open source for educational and non-commercial use.