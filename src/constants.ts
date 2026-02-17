export const CONSTRUCTION_CHECKLIST = {
  version: "1.0",
  phases: [
    {
      id: "P01",
      title: "Pre-Start",
      items: [
        { id: "P01-001", title: "Permits / Approvals", type: "M", min: 0, max: 8 },
        { id: "P01-002", title: "Mobilization + Temporary Utilities", type: "M", min: 0, max: 8 },
        { id: "P01-003", title: "Survey / Setting Out", type: "M", min: 0, max: 8 },
        { id: "P01-004", title: "Shop Drawings / Material Approvals", type: "O", min: 0, max: 8 },
        { id: "P01-005", title: "HSE + QA/QC Plan", type: "O", min: 0, max: 8 }
      ]
    },
    {
      id: "P02",
      title: "Site & Earthworks",
      items: [
        { id: "P02-001", title: "Site Clearance", type: "M", min: 0, max: 8 },
        { id: "P02-002", title: "Demolition (If Any)", type: "O", min: 0, max: 8 },
        { id: "P02-003", title: "Bulk Excavation", type: "O", min: 0, max: 8 },
        { id: "P02-004", title: "Dewatering", type: "O", min: 0, max: 8 },
        { id: "P02-005", title: "Subgrade Compaction Test", type: "H", min: 0, max: 8 }
      ]
    },
    {
      id: "P03",
      title: "Foundations",
      items: [
        { id: "P03-001", title: "Footing Excavation", type: "M", min: 0, max: 8 },
        { id: "P03-002", title: "Blinding / Lean Concrete", type: "O", min: 0, max: 8 },
        { id: "P03-003", title: "Rebar + Formwork", type: "M", min: 0, max: 8 },
        { id: "P03-004", title: "Footing Pour", type: "M", min: 0, max: 8 },
        { id: "P03-005", title: "Footing Columns / Pedestals", type: "O", min: 0, max: 8 },
        { id: "P03-006", title: "Foundation Wall", type: "O", min: 0, max: 8 },
        { id: "P03-007", title: "Waterproofing (Below Grade)", type: "O", min: 0, max: 8 },
        { id: "P03-008", title: "Backfill + Compaction Test", type: "H", min: 0, max: 8 }
      ]
    },
    {
      id: "P04",
      title: "Underground Utilities",
      items: [
        { id: "P04-001", title: "Trench Excavation", type: "O", min: 0, max: 8 },
        { id: "P04-002", title: "Trench Shoring / Box", type: "O", min: 0, max: 8 },
        { id: "P04-003", title: "Bedding", type: "O", min: 0, max: 8 },
        { id: "P04-004", title: "Pipes Installed", type: "O", min: 0, max: 8 },
        { id: "P04-005", title: "Manholes / Catch Basins", type: "O", min: 0, max: 8 },
        { id: "P04-006", title: "Pressure / Leak Testing", type: "H", min: 0, max: 8 },
        { id: "P04-007", title: "Backfill + Compaction Test", type: "H", min: 0, max: 8 }
      ]
    },
    {
      id: "P05",
      title: "Ground Floor",
      items: [
        { id: "P05-001", title: "Sub-base", type: "M", min: 0, max: 8 },
        { id: "P05-002", title: "Vapor Barrier / Insulation", type: "O", min: 0, max: 8 },
        { id: "P05-003", title: "Rebar/Mesh + Sleeves", type: "M", min: 0, max: 8 },
        { id: "P05-004", title: "Slab Pour + Curing", type: "M", min: 0, max: 8 }
      ]
    },
    {
      id: "P06",
      title: "Structure",
      items: [
        { id: "P06-001", title: "Columns / Beams / Frame", type: "O", min: 0, max: 8 },
        { id: "P06-002", title: "Grade Beam", type: "O", min: 0, max: 8 },
        { id: "P06-003", title: "Stairs", type: "O", min: 0, max: 8 }
      ]
    },
    {
      id: "P07",
      title: "Envelope",
      items: [
        { id: "P07-001", title: "External Walls / Cladding", type: "M", min: 0, max: 8 },
        { id: "P07-002", title: "Windows Installed", type: "O", min: 0, max: 8 },
        { id: "P07-003", title: "External Doors Installed", type: "M", min: 0, max: 8 },
        { id: "P07-004", title: "Roof Waterproofing Complete", type: "M", min: 0, max: 8 }
      ]
    },
    {
      id: "P08",
      title: "MEP Rough-In",
      items: [
        { id: "P08-001", title: "Plumbing Rough-In", type: "O", min: 0, max: 8 },
        { id: "P08-002", title: "Electrical Rough-In", type: "O", min: 0, max: 8 },
        { id: "P08-003", title: "HVAC Rough-In", type: "O", min: 0, max: 8 },
        { id: "P08-004", title: "Fire Systems Rough-In", type: "O", min: 0, max: 8 },
        { id: "P08-005", title: "Concealed Inspection", type: "H", min: 0, max: 8 }
      ]
    },
    {
      id: "P09",
      title: "Internal Finishes",
      items: [
        { id: "P09-001", title: "Partitions", type: "O", min: 0, max: 8 },
        { id: "P09-002", title: "Plaster / Drywall Finish", type: "O", min: 0, max: 8 },
        { id: "P09-003", title: "Flooring / Tiling", type: "O", min: 0, max: 8 },
        { id: "P09-004", title: "Ceiling Works", type: "O", min: 0, max: 8 },
        { id: "P09-005", title: "Painting", type: "O", min: 0, max: 8 },
        { id: "P09-006", title: "Joinery / Doors", type: "O", min: 0, max: 8 }
      ]
    },
    {
      id: "P10",
      title: "MEP Fit-Off",
      items: [
        { id: "P10-001", title: "Lights / Switches / Sockets", type: "O", min: 0, max: 8 },
        { id: "P10-002", title: "Plumbing Fixtures", type: "O", min: 0, max: 8 },
        { id: "P10-003", title: "HVAC Equipment", type: "O", min: 0, max: 8 },
        { id: "P10-004", title: "Fire Alarm Devices", type: "O", min: 0, max: 8 }
      ]
    },
    {
      id: "P11",
      title: "Testing & Handover",
      items: [
        { id: "P11-001", title: "Testing & Commissioning", type: "O", min: 0, max: 8 },
        { id: "P11-002", title: "Snag / Punch List", type: "M", min: 0, max: 8 },
        { id: "P11-003", title: "Final Cleaning", type: "M", min: 0, max: 8 },
        { id: "P11-004", title: "As-built Manuals", type: "O", min: 0, max: 8 },
        { id: "P11-005", title: "Final Inspections", type: "M", min: 0, max: 8 }
      ]
    }
  ]
};
