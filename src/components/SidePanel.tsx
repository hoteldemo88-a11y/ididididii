export default function SidePanel() {
  return (
    <div className="pt-2 max-w-[380px]">
      <h2 className="text-[26px] font-bold text-[#1a1a2e] mb-3">Important</h2>
      <p className="text-[15px] text-[#333] leading-[1.6] mb-10">
        Always remember to open the MitID app yourself - there will be no notification
        on your phone/tablet.
      </p>

      <h2 className="text-[26px] font-bold text-[#1a1a2e] mb-3">Netbank support</h2>
      <div className="text-[15px] text-[#333] space-y-1 mb-6">
        <p>Private 70 10 96 12</p>
        <p>Business 70 10 29 47</p>
      </div>

      <p className="text-[15px] text-[#333] leading-[1.7]">
        Opening hours<br />
        Monday to Thursday 08:00 - 22:00<br />
        Friday 08:00 - 18:00<br />
        Saturday 10:00 - 18:00<br />
        Sunday 10:00 - 22:00
      </p>
    </div>
  )
}
