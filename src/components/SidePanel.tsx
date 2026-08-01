export default function SidePanel() {
  return (
    <div className="pt-2 max-w-[380px]">
      <h2 className="text-[26px] font-bold text-[#1a1a2e] mb-3">Vigtigt</h2>
      <p className="text-[15px] text-[#333] leading-[1.6] mb-10">
        Husk altid selv at åbne MitID-appen – der kommer ingen notifikation
        på din telefon/tablet.
      </p>

      <h2 className="text-[26px] font-bold text-[#1a1a2e] mb-3">Netbank support</h2>
      <div className="text-[15px] text-[#333] space-y-1 mb-6">
        <p>Privat 70 10 96 12</p>
        <p>Erhverv 70 10 29 47</p>
      </div>

      <p className="text-[15px] text-[#333] leading-[1.7]">
        Åbningstider<br />
        Mandag til torsdag 08:00 – 22:00<br />
        Fredag 08:00 – 18:00<br />
        Lørdag 10:00 – 18:00<br />
        Søndag 10:00 – 22:00
      </p>
    </div>
  )
}
