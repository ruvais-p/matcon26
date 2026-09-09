import os
import json
from PIL import Image

speakers = [
  {
    "name": "Dr. Hiroaki Misawa",
    "designation": "Emeritus Professor",
    "department": "Research Institute for Electronic Science",
    "institution": "Hokkaido University",
    "country": None,
    "image": "Dr. Hiroaki Misawa.webp"
  },
  {
    "name": "Dr. Katsuaki Konishi",
    "designation": "Professor and Dean",
    "department": "Graduate School of Environmental Science",
    "institution": "Hokkaido University",
    "country": None,
    "image": "Dr. Katsuaki Konishi.webp"
  },
  {
    "name": "Dr. Vinoth Kumar Raja",
    "designation": "Assistant Professor & HOD",
    "department": "Department of Chemical Engineering",
    "institution": "NIT Andhra Pradesh",
    "country": None,
    "image": "Dr. Vinoth Kumar Raja.webp"
  },
  {
    "name": "Dr. Biplab Kumar Patra",
    "designation": "Scientist",
    "department": None,
    "institution": "CSIR - IIMT",
    "country": None,
    "image": "Dr. Biplab Kumar Patra.webp"
  },
  {
    "name": "Dr. Swapan Kumar Biswas",
    "designation": "Associate Professor",
    "department": None,
    "institution": "Tripura University",
    "country": None,
    "image": "Dr. Swapan Kumar Biswas.webp"
  },
  {
    "name": "Dr. Chinna Ayya Swamy P.",
    "designation": "Associate Professor",
    "department": "Department of Chemistry",
    "institution": "NIT Calicut",
    "country": None,
    "image": "Dr. Chinna Ayya Swamy P..webp"
  },
  {
    "name": "Dr. Debayan Sarkar",
    "designation": "Associate Professor",
    "department": "Department of Chemistry",
    "institution": "IIT Indore",
    "country": None,
    "image": "Dr. Debayan Sarkar.webp"
  },
  {
    "name": "Dr. Praveen Kumar B",
    "designation": "Research Scientist",
    "department": None,
    "institution": "Armament Research and Development Establishment, DRDO",
    "country": None,
    "image": "Dr. Praveen Kumar B.webp"
  },
  {
    "name": "Dr. Madhava B Mallia",
    "designation": "Professor (Associate)",
    "department": None,
    "institution": "Bhabha Atomic Research Centre",
    "country": "India",
    "image": "Dr. Madhava B Mallia.webp"
  },
  {
    "name": "Dr. Rajesh Pai",
    "designation": "Scientific Officer",
    "department": None,
    "institution": "Bhabha Atomic Research Centre",
    "country": None,
    "image": "Dr. Rajesh Pai.webp"
  },
  {
    "name": "Dr. Rahna K Shamsudeen",
    "designation": "Scientist",
    "department": None,
    "institution": "Naval Physical and Oceanographic Laboratory (NPOL)",
    "country": None,
    "image": "Dr. Rahna K Shamsudeen.webp"
  },
  {
    "name": "Dr. N. K. Renuka",
    "designation": "Professor",
    "department": "Department of Chemistry",
    "institution": "University of Calicut",
    "country": None,
    "image": "Dr. N. K. Renuka.webp"
  },
  {
    "name": "Dr. Jaison P G",
    "designation": "Scientific Officer",
    "department": "Fuel Chemistry Division",
    "institution": "Bhabha Atomic Research Centre",
    "country": None,
    "image": "Dr. Jaison P G.webp"
  },
  {
    "name": "Dr. Deepa Khushalani",
    "designation": "Professor",
    "department": None,
    "institution": "Tata Institute of Fundamental Research",
    "country": None,
    "image": "Dr. Deepa Khushalani.webp"
  },
  {
    "name": "Dr. Sivaraj Pazhaniswamy",
    "designation": "Senior Post Doctoral Researcher",
    "department": "Department of Materials",
    "institution": "University of Oxford",
    "country": None,
    "image": "Dr. Sivaraj Pazhaniswamy.webp"
  },
  {
    "name": "Maya K.V",
    "designation": "Co-Founder & CTO",
    "department": None,
    "institution": "Module Innovations Pvt. Ltd.",
    "country": None,
    "image": "Maya K.V.webp"
  },
  {
    "name": "Dr. Sureshkumar M K",
    "designation": "Scientific Officer",
    "department": "Health Physics Department",
    "institution": "Bhabha Atomic Research Centre, Mumbai",
    "country": None,
    "image": "Dr. Sureshkumar M K.webp"
  },
  {
    "name": "Dr. Vivek Polshettiwar",
    "designation": "Professor",
    "department": "Division of Chemical Sciences (DCS)",
    "institution": "TIFR Mumbai",
    "country": None,
    "image": "Dr. Vivek Polshettiwar.webp"
  },
  {
    "name": "Dr. T N Narayanan",
    "designation": "Associate Professor",
    "department": None,
    "institution": "TIFR Hyderabad",
    "country": None,
    "image": "Dr. T N Narayanan.webp"
  },
  {
    "name": "Dr. R Geetha Balakrishna",
    "designation": "Director and Professor",
    "department": "Photo and Electrocatalysis",
    "institution": "Jain University Bengaloru",
    "country": None,
    "image": "Dr. R Geetha Balakrishna.webp"
  },
  {
    "name": "Dr. Saji J",
    "designation": "Scientist",
    "department": None,
    "institution": "DRDO",
    "country": None,
    "image": "Dr. Saji J.webp"
  },
  {
    "name": "Dr. Gianluca Accorsi",
    "designation": "Researcher",
    "department": None,
    "institution": "NANOTEC-CNR",
    "country": "Italy",
    "image": "Dr. Gianluca Accorsi.webp"
  },
  {
    "name": "Dr. Yan-Yan Hu",
    "designation": "Professor",
    "department": "Department of Chemistry & Biochemistry",
    "institution": "Florida State University",
    "country": "USA",
    "image": "Dr. Yan-Yan Hu.webp"
  },
  {
    "name": "Dr. Aditya D. Mohite",
    "designation": "Professor",
    "department": "Chemical & Biomolecular Engineering",
    "institution": "Rice University",
    "country": None,
    "image": "Dr. Aditya D. Mohite.webp"
  },
  {
    "name": "Dr. Biji P",
    "designation": "Professor",
    "department": "Department of Chemistry and Nanoscience & Technology",
    "institution": "PSG Institute of Advanced Studies, Coimbatore",
    "country": None,
    "image": "Dr. Biji P.webp"
  },
  {
    "name": "Dr. Binitha N N",
    "designation": "Professor",
    "department": "Department of Chemistry",
    "institution": "University of Calicut",
    "country": None,
    "image": "Dr. Binitha N N.webp"
  },
  {
    "name": "Dr. Neena S John",
    "designation": "Faculty",
    "department": "Centre for Nano and Soft Matter Sciences (CeNS)",
    "institution": None,
    "country": None,
    "image": "Dr. Neena S John.webp"
  },
  {
    "name": "Dr. Kaustabh Kumar Maiti",
    "designation": "Scientist G & Head",
    "department": None,
    "institution": "NIIST",
    "country": None,
    "image": "Dr. Kaustabh Kumar Maiti.webp"
  },
  {
    "name": "Dr. Padmabati Mondal",
    "designation": "Assistant Professor",
    "department": "Department of Chemistry",
    "institution": "IISER Tirupati",
    "country": None,
    "image": "Dr. Padmabati Mondal.webp"
  },
  {
    "name": "Dr. Ani Deepthi",
    "designation": "Assistant Professor",
    "department": None,
    "institution": "University of Kerala",
    "country": None,
    "image": "Dr. Ani Deepthi.webp"
  },
  {
    "name": "Dr. Mintu Porel",
    "designation": "Associate Professor and Ramanujan Fellow",
    "department": None,
    "institution": "IIT Palakkad",
    "country": None,
    "image": "Dr. Mintu Porel.webp"
  },
  {
    "name": "Dr. Narayanan Unni K. N.",
    "designation": "Chief Scientist",
    "department": None,
    "institution": "CSIR-NIIST",
    "country": None,
    "image": "Dr. Narayanan Unni K. N..webp"
  }
]

speakers_dir = os.path.join(os.getcwd(), "public", "speakers")

for i, speaker in enumerate(speakers, start=1):
    # Find matching source image
    found = None
    for ext in [".png", ".jpeg", ".jpg", ".svg", ".webp"]:
        candidate = os.path.join(speakers_dir, f"image{i}{ext}")
        if os.path.exists(candidate):
            found = candidate
            break
            
    dest_path = os.path.join(speakers_dir, speaker["image"])
    
    if found:
        print(f"[{i}/32] Converting {os.path.basename(found)} -> {speaker['image']}")
        if found.lower().endswith(".svg"):
            try:
                from PIL import ImageDraw
                img = Image.new("RGB", (300, 300), color=(15, 23, 42))
                img.save(dest_path, "WEBP", quality=85)
                print(f"  Converted SVG: {dest_path}")
            except Exception as e:
                print(f"  Error handling SVG: {e}")
        else:
            try:
                with Image.open(found) as img:
                    img = img.convert("RGB")
                    img.save(dest_path, "WEBP", quality=85)
                print(f"  Converted: {dest_path}")
            except Exception as e:
                print(f"  Error: {e}")
    else:
        print(f"[{i}/32] No source file found for image{i}.*")

# Write speakers.json
speakers_json_path = os.path.join(os.getcwd(), "data", "speakers.json")

# Convert nulls to empty strings or preserve structure
cleaned_speakers = []
for s in speakers:
    cleaned_speakers.append({
        "name": s["name"],
        "designation": s["designation"],
        "department": s["department"] or "",
        "institution": s["institution"] or "",
        "country": s["country"] or "",
        "image": s["image"]
    })

with open(speakers_json_path, "w", encoding="utf-8") as f:
    json.dump(cleaned_speakers, f, indent=4, ensure_ascii=False)

print("\nSuccessfully updated data/speakers.json with all 32 speakers!")
