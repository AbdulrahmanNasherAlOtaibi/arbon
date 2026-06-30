export default function Slide4Tech() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      dir="rtl"
      style={{
        background: "radial-gradient(ellipse 60% 50% at 50% 80%, #191C21 0%, #0F1013 55%)",
        fontFamily: "'Cairo', sans-serif",
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{ height: "0.4vh", background: "linear-gradient(90deg, transparent, #C0C4CC 50%, transparent)" }}
      />

      {/* Slide number */}
      <div
        className="absolute font-semibold"
        style={{ top: "4vh", right: "5vw", fontSize: "2.2vw", color: "#8A8F98" }}
      >
        04
      </div>

      {/* Title */}
      <div
        className="absolute font-black font-display"
        style={{ top: "8vh", right: "6vw", fontSize: "5vw", color: "#E8E9EB", letterSpacing: "-0.01em" }}
      >
        التقنيات المستخدمة
      </div>

      {/* Divider */}
      <div
        className="absolute"
        style={{ top: "20vh", right: "6vw", width: "8vw", height: "0.5vh", background: "#C0C4CC", borderRadius: 4 }}
      />

      {/* 2x3 Grid */}
      <div
        className="absolute grid grid-cols-2 gap-[2vh_3vw]"
        style={{ top: "23vh", right: "6vw", left: "6vw", height: "66vh" }}
      >
        {/* Box 1: Frontend */}
        <div
          className="rounded-xl p-[2vh_2.5vw] flex flex-col"
          style={{ background: "#1D2024", border: "1px solid #2E3136" }}
        >
          <div className="font-bold mb-[0.8vh]" style={{ fontSize: "2.8vw", color: "#C0C4CC" }}>الواجهة الأمامية</div>
          <div style={{ fontSize: "2.4vw", color: "#8A8F98", lineHeight: 1.5 }}>
            React 19 · TypeScript 5.9 · Vite 7
          </div>
          <div style={{ fontSize: "2.4vw", color: "#8A8F98", lineHeight: 1.5 }}>
            Tailwind CSS v4 · shadcn/ui · Radix UI
          </div>
        </div>

        {/* Box 2: Backend */}
        <div
          className="rounded-xl p-[2vh_2.5vw] flex flex-col"
          style={{ background: "#1D2024", border: "1px solid #2E3136" }}
        >
          <div className="font-bold mb-[0.8vh]" style={{ fontSize: "2.8vw", color: "#C0C4CC" }}>الخادم الخلفي</div>
          <div style={{ fontSize: "2.4vw", color: "#8A8F98", lineHeight: 1.5 }}>
            Node.js 24 · Express 5
          </div>
          <div style={{ fontSize: "2.4vw", color: "#8A8F98", lineHeight: 1.5 }}>
            Pino Logging · CORS · Cookie Parser
          </div>
        </div>

        {/* Box 3: Database */}
        <div
          className="rounded-xl p-[2vh_2.5vw] flex flex-col"
          style={{ background: "#1D2024", border: "1px solid #2E3136" }}
        >
          <div className="font-bold mb-[0.8vh]" style={{ fontSize: "2.8vw", color: "#C0C4CC" }}>قاعدة البيانات</div>
          <div style={{ fontSize: "2.4vw", color: "#8A8F98", lineHeight: 1.5 }}>
            PostgreSQL · Drizzle ORM v0.45
          </div>
          <div style={{ fontSize: "2.4vw", color: "#8A8F98", lineHeight: 1.5 }}>
            drizzle-kit · drizzle-zod
          </div>
        </div>

        {/* Box 4: API */}
        <div
          className="rounded-xl p-[2vh_2.5vw] flex flex-col"
          style={{ background: "#1D2024", border: "1px solid #2E3136" }}
        >
          <div className="font-bold mb-[0.8vh]" style={{ fontSize: "2.8vw", color: "#C0C4CC" }}>عقد الـ API</div>
          <div style={{ fontSize: "2.4vw", color: "#8A8F98", lineHeight: 1.5 }}>
            OpenAPI 3.x · Orval Codegen
          </div>
          <div style={{ fontSize: "2.4vw", color: "#8A8F98", lineHeight: 1.5 }}>
            Zod v4 · TanStack Query v5
          </div>
        </div>

        {/* Box 5: Tools */}
        <div
          className="rounded-xl p-[2vh_2.5vw] flex flex-col"
          style={{ background: "#1D2024", border: "1px solid #2E3136" }}
        >
          <div className="font-bold mb-[0.8vh]" style={{ fontSize: "2.8vw", color: "#C0C4CC" }}>أدوات البناء</div>
          <div style={{ fontSize: "2.4vw", color: "#8A8F98", lineHeight: 1.5 }}>
            pnpm Workspaces · esbuild 0.27
          </div>
          <div style={{ fontSize: "2.4vw", color: "#8A8F98", lineHeight: 1.5 }}>
            Prettier · TypeScript tsc
          </div>
        </div>

        {/* Box 6: UX */}
        <div
          className="rounded-xl p-[2vh_2.5vw] flex flex-col"
          style={{ background: "#1D2024", border: "1px solid #2E3136" }}
        >
          <div className="font-bold mb-[0.8vh]" style={{ fontSize: "2.8vw", color: "#C0C4CC" }}>تجربة المستخدم</div>
          <div style={{ fontSize: "2.4vw", color: "#8A8F98", lineHeight: 1.5 }}>
            Cairo Font · Wouter Router
          </div>
          <div style={{ fontSize: "2.4vw", color: "#8A8F98", lineHeight: 1.5 }}>
            Framer Motion · Lucide React
          </div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{ height: "0.4vh", background: "linear-gradient(90deg, transparent, #C0C4CC 50%, transparent)" }}
      />
    </div>
  );
}
