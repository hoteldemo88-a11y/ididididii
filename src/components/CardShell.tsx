export default function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="bg-white rounded shadow-[0_1px_4px_rgba(0,0,0,0.06)] w-full max-w-[420px] mx-auto lg:mx-0"
      style={{ minHeight: '560px', fontFamily: "'IBM Plex Sans', Arial, Helvetica, sans-serif" }}
    >
      <div className="flex flex-col h-full px-5 py-5 sm:px-8 sm:py-6">
        {children}
      </div>
    </div>
  )
}
