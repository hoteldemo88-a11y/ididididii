export default function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="bg-white shadow-none mx-auto lg:mx-0"
      style={{ width: 400, minHeight: '24.8rem', height: 588, fontFamily: "'IBM Plex Sans', Arial, Helvetica, FreeSans, sans-serif" }}
    >
      <div className="flex flex-col h-full px-6 py-5">
        {children}
      </div>
    </div>
  )
}
