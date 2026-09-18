import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { rawText, category, tone = 'breaking' } = await request.json();

    if (!rawText || rawText.trim().length < 5) {
      return NextResponse.json(
        { error: 'कृपया बातमीचा कच्चा मसुदा किंवा माहिती प्रविष्ट करा (Please provide news content).' },
        { status: 400 }
      );
    }

    const cleanInput = rawText.trim();

    // Natural Language Marathi Generator based on journalistic patterns
    const result = generateMarathiNewsPackage(cleanInput, category, tone);

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('AI News Assistant Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function generateMarathiNewsPackage(text, category = 'pune', tone = 'breaking') {
  // Extract key sentences / facts
  const sentences = text.split(/[\n.!?।]+/).map(s => s.trim()).filter(s => s.length > 5);
  const mainSubject = sentences[0] || text.slice(0, 80);
  
  // Extract numbers / dates / places if present
  const numbersMatch = text.match(/\d+[\d,.]*/g) || ['१५', '१००', '५००'];
  const hasPune = /pune|पुणे|hinjewadi|हिंजवडी|kothrud|कोथरूड|shivajinagar|शिवाजीनगर/i.test(text);
  const hasMetro = /metro|मेट्रो|train|लोकल/i.test(text);
  const hasJobs = /job|नोकर|भरती|it park|आयटी/i.test(text);
  const hasPolitics = /cm|मंत्री|election|निवडणूक|सरकार|धोरण/i.test(text);
  const hasCrime = /police|पोलीस|गुन्हा|arrest|अटक|accused/i.test(text);

  // Generate 3 Catchy Marathi Headlines
  let headlines = [];
  if (hasMetro) {
    headlines = [
      `पुणेकरांसाठी दिलासा: ${sentences[0]?.slice(0, 60) || 'नवीन मार्गाचे काम पूर्ण'}, प्रवासाचा वेळ वाचणार!`,
      `मोठी बातमी! पुणे मेट्रोचे नवे पाऊल, नागरिकांचा प्रवास होणार अधिक वेगवान आणि सोपा`,
      `Hinjewadi-Shivajinagar: प्रत्यक्ष प्रवाशांचा अनुभव आणि संपूर्ण वेळापत्रक जाहीर`
    ];
  } else if (hasJobs) {
    headlines = [
      `बेरोजगारांसाठी सुवर्णसंधी! पुण्यात ५०००+ नव्या नोकऱ्यांची मेगा भरती जाहीर`,
      `IT Park Expansion: हिंजवडीत नव्या बहुराष्ट्रीय कंपन्यांची एंट्री, तरुणांना मोठी संधी`,
      `उद्योग क्षेत्राला मोठी चालना; पुण्यात सुरू होणार नवीन संशोधन व AI सेंटर्स`
    ];
  } else if (hasCrime) {
    headlines = [
      `पुणे पोलिसांची मोठी कारवाई! ${sentences[0]?.slice(0, 50) || 'गुन्हेगारांना बेड्या'}, तपास सुरू`,
      `धक्कादायक प्रकार उघडकीस: पोलिसांचे विशेष पथक घटनास्थळी दाखल, सतर्कतेचे आदेश`,
      `Crime Alert: शहरातील सुरक्षा व्यवस्था कडक; सीसीटीव्ही फुटेजच्या आधारे तपास`
    ];
  } else if (hasPolitics) {
    headlines = [
      `महाराष्ट्र सरकारचा मोठा निर्णय: ${sentences[0]?.slice(0, 60) || 'नवीन धोरणाला मंजुरी'}!`,
      `मंत्रिमंडळ बैठकीत मोठा निर्णय; जनतेला थेट लाभ मिळणार, वाचा सविस्तर`,
      `राजकीय वर्तुळातून मोठी अपडेट: धोरणात्मक बदलांमुळे महाराष्ट्रात नव्या संधी`
    ];
  } else {
    // Default smart headline generation
    headlines = [
      `ब्रेकिंग न्यूज: ${mainSubject.slice(0, 65)}...`,
      `मोठी अपडेट: ${mainSubject.slice(0, 55)} बाबत प्रशासनाकडून अधिकृत घोषणा!`,
      `विशेष वृत्त: जाणून घ्या काय आहे संपूर्ण प्रकरण आणि त्याचा नागरिकांवर होणारा परिणाम`
    ];
  }

  // Generate 30-word bullet summary (३० शब्दांत ठळक मुद्दे)
  const summaryBullets = [
    `● ${sentences[0]?.slice(0, 70) || 'घटनेची ताजी माहिती समोर आली असून प्रशासनाने तातडीने दखल घेतली आहे.'}`,
    `● ${sentences[1]?.slice(0, 70) || 'संबंधित विभागातील उच्चाधिकाऱ्यांनी प्रत्यक्ष पाहणी करून नागरिकांना दिलासा दिला आहे.'}`,
    `● ${sentences[2]?.slice(0, 70) || 'पुढील २४ तासांत यासंदर्भातील सविस्तर अहवाल व नियमावली जारी केली जाणार आहे.'}`
  ];

  const summary30 = summaryBullets.join('\n');

  // Generate 9:16 Shorts / Reel Voice-Over Script
  const reelScript = `🎬 [0:00 - 0:05] HOOK (कॅमेराकडे रोखून पाहत, हाय-एनर्जी व्हॉईस):
"नमस्कार, पुण्यातून सर्वात मोठी बातमी समोर येत आहे! ${headlines[0]?.slice(0, 60)}..."

⏱️ [0:05 - 0:20] CORE FACTS (स्क्रीनवर व्हिज्युअल किंवा फुटेज दाखवताना):
"नेमकी काय आहे बातमी? तर ${sentences[0] || 'आज प्रशासनाने घेतलेल्या या निर्णयामुळे सर्वसामान्य नागरिकांना मोठा दिलासा मिळणार आहे.'} यामध्ये मुख्यत्वे ${sentences[1] || 'सुरक्षितता आणि कार्यक्षमता वाढवण्यावर भर देण्यात आला आहे.'}"

📢 [0:20 - 0:30] CALL TO ACTION:
"या निर्णयाबद्दल तुमचं काय मत आहे? आम्हाला कमेंट करून नक्की सांगा आणि अशाच सुपरफास्ट बातम्यांसाठी फॉलो करा @Nexvarta!"`;

  // Generate Rich Full Story
  const fullStory = `## ${headlines[0]}

**पुणे (नेक्सवार्ता ब्युरो):** ${text}

### ठळक घडामोडी आणि पार्श्वभूमी:
• **तातडीची कारवाई:** संबंधित प्रशासनाने या विषयावर तत्परता दाखवत आवश्यक पावले उचलली आहेत.
• **नागरिकांची प्रतिक्रिया:** या निर्णयाचे सर्व स्तरांतून स्वागत होत असून दैनंदिन कामकाजाला मोठी गती मिळणार आहे.
• **पुढील दिशा:** अधिकृत सूत्रांनी दिलेल्या माहितीनुसार, या योजनेची अंमलबजावणी त्वरित सुरू केली जाईल.

> "नागरिकांच्या सुविधेसाठी आणि पारदर्शक कामकाजासाठी हे पाऊल अत्यंत महत्त्वाचे आहे." — वरिष्ठ अधिकारी, नेक्सवार्ता विशेष मुलाखत.

---
*अधिक ताज्या घडामोडी आणि व्हिडिओसाठी 'नेक्सवार्ता'ला व्हॉट्सॲप आणि युट्यूबवर फॉलो करा.*`;

  // Determine badge and color
  let badge = 'BREAKING';
  let badgeColor = '#dc2626';
  if (hasMetro) { badge = 'TRANSPORT'; badgeColor = '#ea580c'; }
  else if (hasJobs) { badge = 'EMPLOYMENT'; badgeColor = '#2563eb'; }
  else if (hasCrime) { badge = 'CRIME ALERT'; badgeColor = '#dc2626'; }
  else if (hasPolitics) { badge = 'MAHA POLICY'; badgeColor = '#7c3aed'; }

  return {
    headlines,
    selectedHeadline: headlines[0],
    summary30,
    summaryBullets,
    fullStory,
    reelScript,
    badge,
    badgeColor,
    readTime: '3 min read',
    author: 'Nexvarta AI & Bureau'
  };
}
