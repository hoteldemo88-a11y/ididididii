export default function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="bg-white"
      style={{ width: 400, minHeight: '24.8rem', height: 588, boxSizing: 'content-box' }}
    >
      <div className="flex flex-col h-full px-6 py-5">
        {children}
      </div>
    </div>
  )
}
