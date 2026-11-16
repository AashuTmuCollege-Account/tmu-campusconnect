import requests

API = 'http://localhost:8000/api'
USERNAME = 'admin'
PASSWORD = 'admin123'

r = requests.post(f'{API}/auth/login', data={'username': USERNAME, 'password': PASSWORD})
if not r.ok:
    print(f'Login failed: {r.text}')
    exit(1)
token = r.json()['access_token']
headers = {'Authorization': f'Bearer {token}'}
print('Logged in OK\n')

knowledge_chunks = [
    {
        'name': 'TMU - UG Programs Engineering Medical Management',
        'content': (
            "Teerthanker Mahaveer University TMU Undergraduate Programs Part 1\n\n"
            "ENGINEERING AND IT PROGRAMS:\n"
            "B.Tech Computer Science and Engineering 4 years\n"
            "B.Tech Mechanical Engineering 4 years\n"
            "B.Tech Electronics and Communication Engineering 4 years\n"
            "B.Tech Civil Engineering 4 years\n"
            "B.Tech Electrical Engineering 4 years\n"
            "BCA Bachelor of Computer Applications 3 years\n\n"
            "MEDICAL AND ALLIED HEALTH PROGRAMS:\n"
            "MBBS 5.5 years requires NEET UG\n"
            "BDS Bachelor of Dental Surgery 5 years requires NEET UG\n"
            "B.Sc Nursing 4 years\n"
            "Post Basic B.Sc Nursing 2 years\n"
            "BPT Bachelor of Physiotherapy 4.5 years\n"
            "B.Pharma Bachelor of Pharmacy 4 years\n"
            "Pharm.D Doctor of Pharmacy 6 years\n"
            "B.Optom Bachelor of Optometry 4 years\n"
            "B.Sc MLT Medical Laboratory Techniques 3 years\n"
            "B.Sc RIT Radiological Imaging Techniques 3 years\n"
            "B.Sc Forensic Sciences 3 years\n\n"
            "MANAGEMENT AND COMMERCE:\n"
            "BBA Bachelor of Business Administration 3 years\n"
            "B.Com Bachelor of Commerce 3 years\n"
            "B.Com Hons 3 years\n\n"
            "LAW PROGRAMS:\n"
            "BA-LLB Integrated 5 years\n"
            "BBA-LLB Integrated 5 years\n"
            "B.Com-LLB Integrated 5 years\n"
            "LLB 3 years after graduation"
        )
    },
    {
        'name': 'TMU - PG Programs and PhD',
        'content': (
            "Teerthanker Mahaveer University TMU Postgraduate and Doctoral Programs\n\n"
            "MORE UNDERGRADUATE PROGRAMS:\n"
            "B.Sc Agriculture Hons 4 years ICAR accredited\n"
            "B.Ed Bachelor of Education 2 years\n"
            "BA Bachelor of Arts 3 years\n"
            "BFA Bachelor of Fine Arts 4 years\n"
            "BPEd Bachelor of Physical Education 4 years\n"
            "B.Sc Physics Chemistry Mathematics 3 years\n\n"
            "POSTGRADUATE PROGRAMS AT TMU:\n"
            "M.Tech various specializations 2 years\n"
            "MCA Master of Computer Applications 2 years\n"
            "MD Doctor of Medicine multiple specializations 3 years\n"
            "MS Master of Surgery multiple specializations 3 years\n"
            "MDS Master of Dental Surgery 3 years\n"
            "M.Sc Nursing 2 years\n"
            "MPT Master of Physiotherapy 2 years\n"
            "M.Pharma Master of Pharmacy 2 years\n"
            "MBA Master of Business Administration 2 years\n"
            "M.Com Master of Commerce 2 years\n"
            "LLM Master of Laws 1 year\n"
            "MA Master of Arts various subjects 2 years\n"
            "MFA Master of Fine Arts 2 years\n"
            "M.Ed Master of Education 2 years\n"
            "M.Sc Physics Chemistry Mathematics 2 years\n\n"
            "DOCTORAL PROGRAMS PhD:\n"
            "Ph.D. offered in Engineering, Management, Law, Pharmacy, Physical Education, "
            "Fine Arts, Sciences, Medical specialties, Nursing, Paramedical, Physiotherapy, "
            "Dental Sciences, Agriculture, and Jainology.\n"
            "Eligibility for Ph.D.: Masters degree with minimum 55 percent marks."
        )
    },
    {
        'name': 'TMU - Entrance Exams and How to Apply',
        'content': (
            "Teerthanker Mahaveer University TMU How to Apply for Admission\n\n"
            "HOW TO APPLY FOR TMU ADMISSION:\n"
            "Online: Visit www.tmu.ac.in click on Admissions section\n"
            "Offline: Collect application form from TMU Admission Cell on campus\n"
            "Admissions Toll Free Phone: 1800-270-1490 free call Monday to Saturday\n"
            "Admissions Email: admissions@tmu.ac.in\n\n"
            "ENTRANCE EXAMS REQUIRED BY PROGRAM:\n"
            "B.Tech Engineering: JEE Main score preferred, or CUET, or TMU entrance test\n"
            "MBBS: NEET UG is mandatory no other exam accepted\n"
            "BDS Dental: NEET UG is mandatory\n"
            "MD MS Postgraduate Medical: NEET PG mandatory\n"
            "MBA Management: CAT or MAT or CMAT score, or TMU entrance test\n"
            "Law BA-LLB BBA-LLB: CLAT score or merit based\n"
            "BCA BBA B.Com BA: Merit based no entrance exam required\n"
            "Ph.D.: University entrance test plus interview\n\n"
            "ELIGIBILITY BY PROGRAM:\n"
            "MBBS: 10+2 Physics Chemistry Biology minimum 50 percent, NEET UG qualified, age minimum 17\n"
            "B.Tech: 10+2 Physics Chemistry Maths minimum 50 percent, JEE Main preferred\n"
            "BCA IT programs: 10+2 any stream minimum 45 to 50 percent\n"
            "BDS: 10+2 Physics Chemistry Biology minimum 50 percent, NEET UG qualified\n"
            "B.Pharma: 10+2 PCB or PCM minimum 50 percent\n"
            "B.Sc Nursing: 10+2 PCB minimum 45 to 50 percent\n"
            "BBA: 10+2 any stream minimum 45 to 50 percent\n"
            "MBA: Graduation any discipline minimum 50 percent plus CAT MAT CMAT score\n"
            "LLB 3 year: Graduation minimum 45 percent\n"
            "BA LLB 5 year: 10+2 minimum 45 percent\n"
            "B.Ed: Graduation minimum 50 percent\n"
            "B.Sc Agriculture: 10+2 PCB or PCM minimum 50 percent"
        )
    },
    {
        'name': 'TMU - Documents Required and Admission Dates',
        'content': (
            "Teerthanker Mahaveer University TMU Documents Required for Admission\n\n"
            "DOCUMENTS REQUIRED AT TIME OF ADMISSION TO TMU:\n"
            "1. Class 10 Marksheet and Pass Certificate\n"
            "2. Class 12 Marksheet and Pass Certificate\n"
            "3. Graduation or Post-Graduation certificate for PG programs\n"
            "4. Entrance Exam Scorecard NEET UG for MBBS BDS Nursing, JEE Main for BTech, CAT for MBA, CLAT for Law\n"
            "5. Transfer Certificate from previous school or college\n"
            "6. Migration Certificate required if from outside Uttar Pradesh\n"
            "7. Caste Certificate for SC ST OBC category students\n"
            "8. Income Certificate for scholarship and EWS category\n"
            "9. 4 to 6 recent passport size photographs colour\n"
            "10. Government issued Photo ID Aadhaar Card preferred\n"
            "11. Medical Fitness Certificate for MBBS BDS Nursing Pharmacy programs\n\n"
            "ADMISSION TIMELINE FOR TMU:\n"
            "March to April: Application forms available online and offline\n"
            "May to June: Last date for most undergraduate applications\n"
            "June to July: Entrance exam results declared JEE NEET CAT\n"
            "July to August: TMU counseling rounds and seat allotment\n"
            "August to September: Final admission fee payment and registration\n"
            "August to September: Classes begin for new academic session\n\n"
            "Note: Exact dates change every year. Check www.tmu.ac.in or call 1800-270-1490.\n\n"
            "ADMISSION CELL:\n"
            "Administrative Block Ground Floor TMU Campus\n"
            "N.H.-9 Delhi Road Moradabad 244001\n"
            "Open Monday to Saturday 9 AM to 5 PM"
        )
    },
    {
        'name': 'TMU - All Department Contacts and Portals',
        'content': (
            "Teerthanker Mahaveer University TMU All Department Contacts\n\n"
            "MAIN UNIVERSITY CONTACT INFORMATION:\n"
            "Full Address: Teerthanker Mahaveer University, N.H.-9, Delhi Road, Moradabad 244001, UP India\n"
            "Admissions Toll-Free Number: 1800-270-1490\n"
            "General Phone: 0591-247-6801 and 0591-236-0500\n"
            "Admissions Email: admissions@tmu.ac.in\n"
            "University General Email: university@tmu.ac.in\n"
            "Official Website: www.tmu.ac.in\n\n"
            "DEPARTMENT EMAIL CONTACTS:\n"
            "Medical College MBBS MD MS: tmmc@tmu.ac.in\n"
            "Dental College BDS MDS: dental@tmu.ac.in\n"
            "Engineering B.Tech M.Tech: engineering@tmu.ac.in\n"
            "Computing Sciences BCA MCA: ccsit@tmu.ac.in\n"
            "Management BBA MBA: mba@tmu.ac.in\n"
            "Law College LLB LLM: law@tmu.ac.in\n"
            "Nursing College: nursing@tmu.ac.in\n"
            "Pharmacy College: pharmacy@tmu.ac.in\n"
            "Placements CRC: placement@tmu.ac.in\n\n"
            "ONLINE PORTALS FOR TMU STUDENTS:\n"
            "Main Website: www.tmu.ac.in\n"
            "Student ERP Portal for timetable results fees: erp.tmu.ac.in\n"
            "Online Admissions Portal: admissions.tmu.ac.in\n"
            "UP Scholarship Portal: scholarship.up.gov.in\n"
            "National Scholarship Portal: scholarships.gov.in"
        )
    },
    {
        'name': 'TMU - Frequently Asked Questions',
        'content': (
            "Teerthanker Mahaveer University TMU Frequently Asked Questions\n\n"
            "Q Where is TMU located?\n"
            "A NH-9 Delhi Road Moradabad 244001 Uttar Pradesh about 165 km from Delhi.\n\n"
            "Q Is TMU government or private university?\n"
            "A TMU is a private university established in 2008 recognized by UGC.\n\n"
            "Q What is TMU NAAC grade?\n"
            "A TMU holds NAAC A Grade accreditation valid until June 2027.\n\n"
            "Q How can I apply for admission to TMU?\n"
            "A Apply online at www.tmu.ac.in or call toll free 1800-270-1490.\n\n"
            "Q Does TMU have hostel facilities?\n"
            "A Yes TMU has separate hostels for boys and girls with capacity for about 4600 students.\n\n"
            "Q What entrance exam is needed for B.Tech?\n"
            "A JEE Main score is preferred. CUET or TMU entrance test also accepted.\n\n"
            "Q Is NEET required for MBBS at TMU?\n"
            "A Yes NEET UG is mandatory for MBBS admission at TMU.\n\n"
            "Q What is the total fee for MBBS at TMU?\n"
            "A Approximately INR 1 Crore for the full 5.5 year course. Call 1800-270-1490 for exact fee.\n\n"
            "Q What are B.Tech fees at TMU?\n"
            "A Approximately INR 3.24 to 5.38 Lakhs total for 4 years depending on branch.\n\n"
            "Q Does TMU offer scholarships?\n"
            "A Yes. Merit based scholarships, Jain minority scholarship up to 50 percent fee waiver, SC ST OBC government scholarships. Call 1800-270-1490.\n\n"
            "Q What is TMU placement rate?\n"
            "A 85 percent placement rate in 2024. Highest package INR 60 LPA.\n\n"
            "Q Which companies recruit from TMU?\n"
            "A TCS Infosys Wipro Accenture Tech Mahindra ICICI Bank HDFC Bank Hero Deloitte Amazon and many more.\n\n"
            "Q Does TMU have a hospital on campus?\n"
            "A Yes TMU Medical College and Research Centre hospital is on campus with free OPD for students.\n\n"
            "Q What is the nearest railway station to TMU?\n"
            "A Moradabad Junction Railway Station approximately 5 km from TMU campus.\n\n"
            "Q How do I check exam results or timetable?\n"
            "A Log into the student ERP portal at erp.tmu.ac.in with your student credentials.\n\n"
            "Q Does TMU have Wi-Fi?\n"
            "A Yes high-speed Wi-Fi is available throughout campus and hostels.\n\n"
            "Q Is MBA available at TMU?\n"
            "A Yes 2 year MBA at TMIMT College of Management. Accepts CAT MAT CMAT scores.\n\n"
            "Q What is the admission deadline?\n"
            "A Applications open March and close June to July. Check www.tmu.ac.in for exact dates."
        )
    }
]

success = 0
failed = 0
for chunk in knowledge_chunks:
    form_data = {
        'name': chunk['name'],
        'content': chunk['content'],
        'description': 'Official information about Teerthanker Mahaveer University TMU'
    }
    r = requests.post(f'{API}/knowledge/upload-text', data=form_data, headers=headers)
    if r.ok:
        print(f'[OK] {chunk["name"]}')
        success += 1
    else:
        print(f'[FAIL] {chunk["name"]} - {r.status_code}: {r.text[:100]}')
        failed += 1

print(f'\nResult: {success} uploaded, {failed} failed.')
