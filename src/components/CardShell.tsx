export default function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="bg-white rounded shadow-[0_1px_3px_rgba(0,0,0,0.08)] w-full max-w-[400px]"
      style={{ minHeight: '24.8rem', fontFamily: "'IBM Plex Sans', Arial, Helvetica, sans-serif" }}
    >
      <div className="flex flex-col h-full px-[24px] py-[20px]">
        {children}
      </div>
    </div>
  )
}
