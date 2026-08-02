export default function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="bg-white rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.08)] w-full max-w-[420px] mx-auto sm:mx-0"
      style={{ fontFamily: "'IBM Plex Sans', Arial, Helvetica, sans-serif" }}
    >
      <div className="flex flex-col h-full px-5 py-5 sm:px-6 sm:py-5">
        {children}
      </div>
    </div>
  )
}
