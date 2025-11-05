<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\EducationalContent;
use Carbon\Carbon;

class EducationalContentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Seeds 10 bilingual educational articles from Juan Heart Mobile app.
     */
    public function run(): void
    {
        $now = Carbon::now();

        $contents = [
            // 1. CVD Prevention
            [
                'category' => 'cvd_prevention',
                'title_en' => 'Understanding Cardiovascular Disease',
                'title_fil' => 'Pag-unawa sa Sakit sa Puso at Ugat',
                'description_en' => 'Learn about cardiovascular disease, its causes, and how to prevent it through lifestyle changes and regular checkups.',
                'description_fil' => 'Alamin ang tungkol sa sakit sa puso at ugat, ang mga sanhi nito, at kung paano maiwasan ito sa pamamagitan ng pagbabago sa pamumuhay at regular na checkup.',
                'body_en' => '<h2>What is Cardiovascular Disease?</h2><p>Cardiovascular disease (CVD) refers to conditions affecting the heart and blood vessels. It is the leading cause of death worldwide.</p><h3>Common Types:</h3><ul><li>Coronary heart disease</li><li>Stroke</li><li>Heart failure</li><li>Peripheral arterial disease</li></ul><h3>Risk Factors:</h3><p>High blood pressure, high cholesterol, smoking, diabetes, obesity, physical inactivity, unhealthy diet, and excessive alcohol consumption.</p><h3>Prevention:</h3><p>Maintain a healthy diet, exercise regularly, avoid smoking, limit alcohol, manage stress, and get regular health checkups.</p>',
                'body_fil' => '<h2>Ano ang Sakit sa Puso at Ugat?</h2><p>Ang sakit sa puso at ugat (CVD) ay tumutukoy sa mga kondisyon na nakakaapekto sa puso at mga daluyan ng dugo. Ito ang pangunahing sanhi ng kamatayan sa buong mundo.</p><h3>Mga Karaniwang Uri:</h3><ul><li>Coronary heart disease</li><li>Stroke</li><li>Pagpalya ng puso</li><li>Peripheral arterial disease</li></ul><h3>Mga Panganib:</h3><p>Mataas na presyon ng dugo, mataas na kolesterol, paninigarilyo, diabetes, labis na timbang, kakulangan sa ehersisyo, hindi malusog na pagkain, at labis na pag-inom ng alak.</p><h3>Pag-iwas:</h3><p>Magkaroon ng malusog na pagkain, regular na ehersisyo, iwasang manigarilyo, limitahan ang alak, pamahalaan ang stress, at magpakonsulta nang regular.</p>',
                'reading_time_minutes' => 8,
                'author' => 'Dr. Maria Santos',
                'published' => true,
                'views' => 0,
                'version' => 1,
                'created_at' => $now->copy()->subDays(5),
                'updated_at' => $now->copy()->subDays(5),
            ],

            // 2. CVD Prevention
            [
                'category' => 'cvd_prevention',
                'title_en' => 'The Role of Diet in Heart Health',
                'title_fil' => 'Ang Papel ng Pagkain sa Kalusugan ng Puso',
                'description_en' => 'Discover how your diet affects heart health and learn about heart-healthy foods that can reduce CVD risk.',
                'description_fil' => 'Alamin kung paano nakakaapekto ang iyong pagkain sa kalusugan ng puso at mag-aral tungkol sa mga pagkaing mabuti para sa puso.',
                'body_en' => '<h2>Eating for a Healthy Heart</h2><p>Your diet plays a crucial role in maintaining heart health and preventing cardiovascular disease.</p><h3>Heart-Healthy Foods:</h3><ul><li>Fruits and vegetables</li><li>Whole grains</li><li>Lean proteins (fish, chicken)</li><li>Nuts and seeds</li><li>Healthy fats (olive oil, avocado)</li></ul><h3>Foods to Limit:</h3><ul><li>Saturated and trans fats</li><li>High-sodium foods</li><li>Added sugars</li><li>Processed meats</li></ul><h3>Filipino Heart-Healthy Choices:</h3><p>Choose grilled fish over fried, use less salt and patis, eat more fresh fruits, and limit consumption of high-fat Filipino dishes.</p>',
                'body_fil' => '<h2>Pagkain para sa Malusog na Puso</h2><p>Ang iyong pagkain ay may mahalagang papel sa pagpapanatili ng kalusugan ng puso at pag-iwas sa sakit sa puso.</p><h3>Mga Pagkaing Mabuti sa Puso:</h3><ul><li>Prutas at gulay</li><li>Whole grains</li><li>Lean na protina (isda, manok)</li><li>Nuts at seeds</li><li>Malusog na taba (olive oil, abokado)</li></ul><h3>Mga Pagkaing Dapat Limitahan:</h3><ul><li>Saturated at trans fats</li><li>Mataas na asin</li><li>Added sugars</li><li>Processed meats</li></ul><h3>Pilipinong Pagkaing Mabuti sa Puso:</h3><p>Piliin ang inihaw na isda kaysa prito, gumamit ng mas kaunting asin at patis, kumain ng mas maraming sariwang prutas, at limitahan ang pagkain ng high-fat Filipino dishes.</p>',
                'reading_time_minutes' => 6,
                'author' => 'Nutritionist Ana Cruz',
                'published' => true,
                'views' => 0,
                'version' => 1,
                'created_at' => $now->copy()->subDays(10),
                'updated_at' => $now->copy()->subDays(10),
            ],

            // 3. CVD Prevention
            [
                'category' => 'cvd_prevention',
                'title_en' => 'Exercise and Heart Health',
                'title_fil' => 'Ehersisyo at Kalusugan ng Puso',
                'description_en' => 'Learn how regular physical activity strengthens your heart and reduces cardiovascular disease risk.',
                'description_fil' => 'Alamin kung paano ang regular na ehersisyo ay nagpapalakas ng iyong puso at nagpapababa ng panganib ng sakit sa puso.',
                'body_en' => '<h2>Move More for a Healthy Heart</h2><p>Regular physical activity is one of the best ways to prevent heart disease.</p><h3>Benefits of Exercise:</h3><ul><li>Strengthens heart muscle</li><li>Lowers blood pressure</li><li>Reduces bad cholesterol</li><li>Helps control weight</li><li>Reduces stress</li></ul><h3>Recommended Activity:</h3><p>Aim for at least 150 minutes of moderate exercise per week, such as brisk walking, cycling, or swimming.</p><h3>Getting Started:</h3><p>Start slow, set realistic goals, find activities you enjoy, and make exercise a daily habit.</p>',
                'body_fil' => '<h2>Magkilos Nang Higit pa para sa Malusog na Puso</h2><p>Ang regular na pisikal na aktibidad ay isa sa pinakamahusay na paraan upang maiwasan ang sakit sa puso.</p><h3>Benepisyo ng Ehersisyo:</h3><ul><li>Nagpapalakas ng kalamnan ng puso</li><li>Nagpapababa ng presyon ng dugo</li><li>Nagpapababa ng masamang kolesterol</li><li>Tumutulong kontrolin ang timbang</li><li>Nagpapababa ng stress</li></ul><h3>Inirerekomendang Aktibidad:</h3><p>Maglaan ng hindi bababa sa 150 minuto ng katamtamang ehersisyo bawat linggo, tulad ng mabilis na paglakad, pagbibisikleta, o paglangoy.</p><h3>Pagsisimula:</h3><p>Magsimula nang dahan-dahan, magtakda ng makatotohanang layunin, humanap ng mga aktibidad na iyong nais, at gawin ang ehersisyo na pang-araw-araw na gawi.</p>',
                'reading_time_minutes' => 5,
                'author' => 'Dr. Jose Reyes',
                'published' => true,
                'views' => 0,
                'version' => 1,
                'created_at' => $now->copy()->subDays(15),
                'updated_at' => $now->copy()->subDays(15),
            ],

            // 4. Symptom Recognition
            [
                'category' => 'symptom_recognition',
                'title_en' => 'Warning Signs of Heart Attack',
                'title_fil' => 'Mga Babala ng Heart Attack',
                'description_en' => 'Recognize the warning signs of a heart attack and learn when to seek emergency medical help.',
                'description_fil' => 'Kilalanin ang mga babala ng heart attack at alamin kung kailan dapat humingi ng emergency medical help.',
                'body_en' => '<h2>Heart Attack Warning Signs</h2><p>Recognizing heart attack symptoms early can save lives. Call emergency services immediately if you experience these symptoms.</p><h3>Common Symptoms:</h3><ul><li>Chest pain or discomfort</li><li>Pain in arms, back, neck, jaw, or stomach</li><li>Shortness of breath</li><li>Cold sweat</li><li>Nausea or lightheadedness</li></ul><h3>What to Do:</h3><p>Call emergency services (911 or local emergency number) immediately. Do not drive yourself to the hospital. Chew aspirin if available while waiting for help.</p><h3>Important Note:</h3><p>Women may experience different symptoms, including fatigue, sleep problems, and indigestion.</p>',
                'body_fil' => '<h2>Mga Babala ng Heart Attack</h2><p>Ang maagang pagkilala sa mga sintomas ng heart attack ay maaaring makaligtas ng buhay. Tumawag kaagad ng emergency services kung makakaranas ka ng mga sintomas na ito.</p><h3>Mga Karaniwang Sintomas:</h3><ul><li>Sakit o discomfort sa dibdib</li><li>Sakit sa mga braso, likod, leeg, panga, o tiyan</li><li>Hirap sa paghinga</li><li>Malamig na pawis</li><li>Pagduduwal o pagkahilo</li></ul><h3>Ano ang Gagawin:</h3><p>Tumawag kaagad ng emergency services (911 o local emergency number). Huwag magmaneho papunta sa ospital. Ngumuya ng aspirin kung available habang naghihintay ng tulong.</p><h3>Mahalagang Paalala:</h3><p>Ang mga kababaihan ay maaaring makaranas ng iba\'t ibang sintomas, kabilang ang pagkapagod, problema sa pagtulog, at indigestion.</p>',
                'reading_time_minutes' => 4,
                'author' => 'Dr. Maria Santos',
                'published' => true,
                'views' => 0,
                'version' => 1,
                'created_at' => $now->copy()->subDays(3),
                'updated_at' => $now->copy()->subDays(3),
            ],

            // 5. Symptom Recognition
            [
                'category' => 'symptom_recognition',
                'title_en' => 'Stroke Warning Signs: FAST',
                'title_fil' => 'Mga Babala ng Stroke: FAST',
                'description_en' => 'Learn to recognize stroke symptoms using the FAST method and understand why quick action is critical.',
                'description_fil' => 'Matutong kilalanin ang mga sintomas ng stroke gamit ang FAST method at unawain kung bakit mahalaga ang mabilis na aksyon.',
                'body_en' => '<h2>FAST: Recognizing Stroke</h2><p>Stroke is a medical emergency. Use FAST to quickly identify stroke symptoms.</p><h3>F - Face Drooping</h3><p>Does one side of the face droop or is it numb? Ask the person to smile.</p><h3>A - Arm Weakness</h3><p>Is one arm weak or numb? Ask the person to raise both arms.</p><h3>S - Speech Difficulty</h3><p>Is speech slurred? Is the person unable to speak or hard to understand?</p><h3>T - Time to Call Emergency</h3><p>If someone shows any of these symptoms, call emergency services immediately. Note the time symptoms began.</p><h3>Why It Matters:</h3><p>Treatment within 3-4.5 hours of symptom onset can significantly improve outcomes.</p>',
                'body_fil' => '<h2>FAST: Pagkilala sa Stroke</h2><p>Ang stroke ay isang medical emergency. Gamitin ang FAST upang mabilis na makilala ang mga sintomas ng stroke.</p><h3>F - Face Drooping (Paglupasay ng Mukha)</h3><p>Lumubog ba o manhid ang isang bahagi ng mukha? Hilingin sa tao na ngumiti.</p><h3>A - Arm Weakness (Panghihina ng Braso)</h3><p>Mahina o manhid ba ang isang braso? Hilingin sa tao na itaas ang dalawang braso.</p><h3>S - Speech Difficulty (Hirap sa Pagsasalita)</h3><p>Malabo ba ang pagsasalita? Hindi ba makapagsalita o mahirap unawain ang tao?</p><h3>T - Time to Call Emergency (Oras na Tumawag ng Emergency)</h3><p>Kung may nagpapakita ng alinman sa mga sintomas na ito, tumawag kaagad ng emergency services. Tandaan ang oras ng pagsimula ng mga sintomas.</p><h3>Bakit Mahalaga:</h3><p>Ang paggamot sa loob ng 3-4.5 oras mula sa pagsimula ng sintomas ay makabuluhang makakapagpabuti ng mga resulta.</p>',
                'reading_time_minutes' => 5,
                'author' => 'Dr. Pedro Garcia',
                'published' => true,
                'views' => 0,
                'version' => 1,
                'created_at' => $now->copy()->subDays(7),
                'updated_at' => $now->copy()->subDays(7),
            ],

            // 6. Lifestyle Modification
            [
                'category' => 'lifestyle_modification',
                'title_en' => 'Managing Stress for Heart Health',
                'title_fil' => 'Pagpapamahala ng Stress para sa Kalusugan ng Puso',
                'description_en' => 'Discover effective stress management techniques to protect your heart and improve overall wellbeing.',
                'description_fil' => 'Tuklasin ang mga epektibong pamamaraan sa pagpapamahala ng stress upang protektahan ang iyong puso at mapabuti ang kalusugan.',
                'body_en' => '<h2>Stress and Your Heart</h2><p>Chronic stress can contribute to heart disease by raising blood pressure and increasing unhealthy behaviors.</p><h3>Stress Management Techniques:</h3><ul><li>Regular exercise</li><li>Meditation and deep breathing</li><li>Adequate sleep (7-8 hours)</li><li>Social connections</li><li>Hobbies and relaxation</li></ul><h3>Warning Signs of Chronic Stress:</h3><p>Persistent fatigue, irritability, difficulty concentrating, headaches, and sleep problems.</p><h3>When to Seek Help:</h3><p>If stress is overwhelming or affecting daily life, consult a healthcare provider or mental health professional.</p>',
                'body_fil' => '<h2>Stress at ang Iyong Puso</h2><p>Ang talamak na stress ay maaaring mag-ambag sa sakit sa puso sa pamamagitan ng pagtaas ng presyon ng dugo at pagdagdag ng hindi malusog na pag-uugali.</p><h3>Mga Pamamaraan sa Pagpapamahala ng Stress:</h3><ul><li>Regular na ehersisyo</li><li>Meditation at malalim na paghinga</li><li>Sapat na tulog (7-8 oras)</li><li>Koneksyon sa lipunan</li><li>Mga libangan at pagpapahinga</li></ul><h3>Mga Babala ng Talamak na Stress:</h3><p>Patuloy na pagkapagod, pagkairita, hirap sa pag-concentrate, sakit ng ulo, at problema sa pagtulog.</p><h3>Kailan Humingi ng Tulong:</h3><p>Kung ang stress ay napakalaki o nakakaapekto sa pang-araw-araw na buhay, kumonsulta sa healthcare provider o mental health professional.</p>',
                'reading_time_minutes' => 6,
                'author' => 'Dr. Liza Mendoza',
                'published' => true,
                'views' => 0,
                'version' => 1,
                'created_at' => $now->copy()->subDays(12),
                'updated_at' => $now->copy()->subDays(12),
            ],

            // 7. Lifestyle Modification
            [
                'category' => 'lifestyle_modification',
                'title_en' => 'Quitting Smoking for Heart Health',
                'title_fil' => 'Pagtigil sa Paninigarilyo para sa Kalusugan ng Puso',
                'description_en' => 'Learn about the benefits of quitting smoking and strategies to successfully quit for better heart health.',
                'description_fil' => 'Alamin ang mga benepisyo ng pagtigil sa paninigarilyo at mga estratehiya upang matagumpay na huminto para sa mas malusog na puso.',
                'body_en' => '<h2>Why Quit Smoking?</h2><p>Smoking is a major risk factor for heart disease. Quitting can dramatically reduce your CVD risk.</p><h3>Benefits of Quitting:</h3><ul><li>Heart rate normalizes within 20 minutes</li><li>Blood pressure drops within hours</li><li>Heart attack risk drops after 1 year</li><li>CVD risk halves after 5 years</li></ul><h3>Strategies to Quit:</h3><ul><li>Set a quit date</li><li>Use nicotine replacement therapy</li><li>Seek support from friends and family</li><li>Avoid triggers</li><li>Consult healthcare provider</li></ul><h3>Managing Cravings:</h3><p>Cravings typically last 5-10 minutes. Use distraction, deep breathing, or healthy snacks to manage them.</p>',
                'body_fil' => '<h2>Bakit Dapat Tumigil sa Paninigarilyo?</h2><p>Ang paninigarilyo ay pangunahing panganib para sa sakit sa puso. Ang pagtigil ay maaaring marahas na bawasan ang iyong panganib sa CVD.</p><h3>Mga Benepisyo ng Pagtigil:</h3><ul><li>Normal na ang tibok ng puso sa loob ng 20 minuto</li><li>Bumababa ang presyon ng dugo sa loob ng ilang oras</li><li>Bumababa ang panganib ng heart attack pagkatapos ng 1 taon</li><li>Kalahati na lang ang panganib sa CVD pagkatapos ng 5 taon</li></ul><h3>Mga Estratehiya para Tumigil:</h3><ul><li>Magtakda ng petsa ng pagtigil</li><li>Gumamit ng nicotine replacement therapy</li><li>Humingi ng suporta mula sa mga kaibigan at pamilya</li><li>Iwasan ang mga trigger</li><li>Kumonsulta sa healthcare provider</li></ul><h3>Pagpapamahala ng Cravings:</h3><p>Ang mga craving ay kadalasang tumatagal ng 5-10 minuto. Gumamit ng distraction, malalim na paghinga, o malusog na snacks upang pamahalaan ang mga ito.</p>',
                'reading_time_minutes' => 7,
                'author' => 'Dr. Ramon Villarama',
                'published' => true,
                'views' => 0,
                'version' => 1,
                'created_at' => $now->copy()->subDays(20),
                'updated_at' => $now->copy()->subDays(20),
            ],

            // 8. Emergency Response
            [
                'category' => 'emergency_response',
                'title_en' => 'What to Do in a Cardiac Emergency',
                'title_fil' => 'Ano ang Gagawin sa Cardiac Emergency',
                'description_en' => 'Learn critical steps to take during a cardiac emergency, including CPR basics and when to use an AED.',
                'description_fil' => 'Alamin ang mga kritikal na hakbang na gagawin sa panahon ng cardiac emergency, kabilang ang mga basic ng CPR at kung kailan gagamitin ang AED.',
                'body_en' => '<h2>Cardiac Emergency Response</h2><p>Knowing how to respond to a cardiac emergency can save a life.</p><h3>Steps to Take:</h3><ol><li>Call emergency services immediately (911)</li><li>Check if person is responsive and breathing</li><li>If not breathing, start CPR</li><li>Use AED if available</li><li>Continue until help arrives</li></ol><h3>CPR Basics:</h3><p>Place hands on center of chest, push hard and fast (100-120 compressions per minute), allow chest to recoil between compressions.</p><h3>Using an AED:</h3><p>Turn on AED, follow voice prompts, attach pads to bare chest, ensure no one is touching person when shock is delivered.</p><h3>Important:</h3><p>Even imperfect CPR is better than no CPR. Do not hesitate to help.</p>',
                'body_fil' => '<h2>Tugon sa Cardiac Emergency</h2><p>Ang pag-alam kung paano tumugon sa cardiac emergency ay maaaring makaligtas ng buhay.</p><h3>Mga Hakbang:</h3><ol><li>Tumawag kaagad ng emergency services (911)</li><li>Tingnan kung tumutugon at humihinga ang tao</li><li>Kung hindi humihinga, magsimula ng CPR</li><li>Gumamit ng AED kung available</li><li>Magpatuloy hanggang sa dumating ang tulong</li></ol><h3>Mga Basic ng CPR:</h3><p>Ilagay ang mga kamay sa gitna ng dibdib, itulak nang malakas at mabilis (100-120 compressions bawat minuto), hayaan ang dibdib na bumalik sa pagitan ng mga compressions.</p><h3>Paggamit ng AED:</h3><p>Buksan ang AED, sundin ang mga voice prompts, idikit ang mga pads sa hubad na dibdib, tiyakin na walang humahawak sa tao kapag nagbibigay ng shock.</p><h3>Mahalaga:</h3><p>Kahit hindi perpekto ang CPR ay mas mabuti kaysa wala. Huwag mag-atubiling tumulong.</p>',
                'reading_time_minutes' => 6,
                'author' => 'Dr. Maria Santos',
                'published' => true,
                'views' => 0,
                'version' => 1,
                'created_at' => $now->copy()->subDays(2),
                'updated_at' => $now->copy()->subDays(2),
            ],

            // 9. Risk Factors
            [
                'category' => 'risk_factors',
                'title_en' => 'Understanding High Blood Pressure',
                'title_fil' => 'Pag-unawa sa Mataas na Presyon ng Dugo',
                'description_en' => 'Learn about high blood pressure, why it matters for heart health, and how to manage it effectively.',
                'description_fil' => 'Alamin ang tungkol sa mataas na presyon ng dugo, bakit ito mahalaga para sa kalusugan ng puso, at kung paano ito epektibong pamahalaan.',
                'body_en' => '<h2>High Blood Pressure (Hypertension)</h2><p>High blood pressure is often called the "silent killer" because it usually has no symptoms but can cause serious health problems.</p><h3>Blood Pressure Categories:</h3><ul><li>Normal: Less than 120/80 mmHg</li><li>Elevated: 120-129/less than 80</li><li>Stage 1: 130-139/80-89</li><li>Stage 2: 140+/90+</li></ul><h3>Managing High Blood Pressure:</h3><ul><li>Reduce sodium intake</li><li>Exercise regularly</li><li>Maintain healthy weight</li><li>Limit alcohol</li><li>Manage stress</li><li>Take medications as prescribed</li></ul><h3>Regular Monitoring:</h3><p>Check blood pressure regularly and keep records to share with your healthcare provider.</p>',
                'body_fil' => '<h2>Mataas na Presyon ng Dugo (Hypertension)</h2><p>Ang mataas na presyon ng dugo ay madalas na tinatawag na "silent killer" dahil karaniwang walang sintomas ngunit maaaring magdulot ng malubhang mga problema sa kalusugan.</p><h3>Mga Kategorya ng Presyon ng Dugo:</h3><ul><li>Normal: Mas mababa sa 120/80 mmHg</li><li>Elevated: 120-129/mas mababa sa 80</li><li>Stage 1: 130-139/80-89</li><li>Stage 2: 140+/90+</li></ul><h3>Pagpapamahala ng Mataas na Presyon ng Dugo:</h3><ul><li>Bawasan ang sodium intake</li><li>Regular na ehersisyo</li><li>Panatilihin ang malusog na timbang</li><li>Limitahan ang alak</li><li>Pamahalaan ang stress</li><li>Uminom ng gamot ayon sa reseta</li></ul><h3>Regular na Pagsubaybay:</h3><p>Suriin ang presyon ng dugo nang regular at panatilihin ang mga tala upang ibahagi sa iyong healthcare provider.</p>',
                'reading_time_minutes' => 7,
                'author' => 'Dr. Jose Reyes',
                'published' => true,
                'views' => 0,
                'version' => 1,
                'created_at' => $now->copy()->subDays(8),
                'updated_at' => $now->copy()->subDays(8),
            ],

            // 10. Risk Factors
            [
                'category' => 'risk_factors',
                'title_en' => 'Cholesterol and Heart Disease',
                'title_fil' => 'Kolesterol at Sakit sa Puso',
                'description_en' => 'Understand the role of cholesterol in heart disease and learn how to maintain healthy cholesterol levels.',
                'description_fil' => 'Unawain ang papel ng kolesterol sa sakit sa puso at alamin kung paano panatilihin ang malusog na antas ng kolesterol.',
                'body_en' => '<h2>Cholesterol: Good vs. Bad</h2><p>Cholesterol is a fatty substance needed by the body, but too much bad cholesterol can lead to heart disease.</p><h3>Types of Cholesterol:</h3><ul><li>LDL (Bad): Clogs arteries - should be low</li><li>HDL (Good): Removes bad cholesterol - should be high</li><li>Triglycerides: Another type of fat - should be low</li></ul><h3>Healthy Cholesterol Levels:</h3><ul><li>Total cholesterol: Less than 200 mg/dL</li><li>LDL: Less than 100 mg/dL</li><li>HDL: 60 mg/dL or higher</li><li>Triglycerides: Less than 150 mg/dL</li></ul><h3>Improving Cholesterol:</h3><p>Eat heart-healthy foods, exercise regularly, maintain healthy weight, avoid trans fats, and take medications if prescribed.</p>',
                'body_fil' => '<h2>Kolesterol: Mabuti vs. Masama</h2><p>Ang kolesterol ay isang mataba na sangkap na kailangan ng katawan, ngunit ang labis na masamang kolesterol ay maaaring humantong sa sakit sa puso.</p><h3>Mga Uri ng Kolesterol:</h3><ul><li>LDL (Masama): Sumasara sa mga ugat - dapat mababa</li><li>HDL (Mabuti): Nag-aalis ng masamang kolesterol - dapat mataas</li><li>Triglycerides: Isa pang uri ng taba - dapat mababa</li></ul><h3>Malusog na Antas ng Kolesterol:</h3><ul><li>Kabuuang kolesterol: Mas mababa sa 200 mg/dL</li><li>LDL: Mas mababa sa 100 mg/dL</li><li>HDL: 60 mg/dL o mas mataas</li><li>Triglycerides: Mas mababa sa 150 mg/dL</li></ul><h3>Pagpapabuti ng Kolesterol:</h3><p>Kumain ng mga pagkaing mabuti sa puso, regular na ehersisyo, panatilihin ang malusog na timbang, iwasan ang trans fats, at uminom ng gamot kung inreseta.</p>',
                'reading_time_minutes' => 6,
                'author' => 'Dr. Pedro Garcia',
                'published' => true,
                'views' => 0,
                'version' => 1,
                'created_at' => $now->copy()->subDays(18),
                'updated_at' => $now->copy()->subDays(18),
            ],
        ];

        // Insert all content
        foreach ($contents as $content) {
            EducationalContent::create($content);
        }

        $this->command->info('Successfully seeded 10 educational content articles!');
    }
}
