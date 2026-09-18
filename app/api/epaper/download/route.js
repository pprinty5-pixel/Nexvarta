import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const edition = searchParams.get('edition') || 'pune';
  const date = searchParams.get('date') || '13-Sep-2026';

  const editionTitle = edition === 'mumbai' ? 'Mumbai Edition' 
                     : edition === 'maharashtra' ? 'Maharashtra State Edition' 
                     : 'Pune Main Edition';

  const html = `<!DOCTYPE html>
<html lang="mr">
<head>
  <meta charset="UTF-8">
  <title>NEXVARTA E-Paper - ${editionTitle} - ${date}</title>
  <style>
    @page { size: A4 portrait; margin: 10mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #fff; color: #111; padding: 20px; }
    .page { max-width: 800px; margin: 0 auto; border: 2px solid #002255; padding: 20px; }
    .masthead { text-align: center; border-bottom: 3px double #000; padding-bottom: 10px; }
    .masthead h1 { font-size: 3.5rem; color: #002255; margin: 0; letter-spacing: 2px; }
    .bar { display: flex; justify-content: space-between; border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 4px 0; margin: 10px 0; font-weight: bold; font-size: 0.85rem; }
    .headline { font-size: 2rem; font-weight: 900; color: #0f172a; margin: 15px 0 8px; line-height: 1.25; }
    .subhead { font-size: 1.1rem; color: #ea580c; font-weight: bold; margin-bottom: 14px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .image-box { background: #0f172a; color: #fff; height: 220px; display: flex; align-items: center; justify-content: center; text-align: center; border-radius: 4px; }
    .cols3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; border-top: 2px solid #000; padding-top: 14px; margin-top: 20px; }
    .btn { background: #ea580c; color: #fff; padding: 10px 20px; border-radius: 6px; font-weight: bold; text-decoration: none; display: inline-block; margin-bottom: 15px; }
  </style>
</head>
<body>
  <div style="text-align: center; margin-bottom: 15px;" class="no-print">
    <button onclick="window.print()" style="background: #003884; color: #fff; padding: 10px 24px; font-size: 16px; font-weight: bold; border-radius: 6px; cursor: pointer; border: none;">
      🖨️ PDF म्हणून सेव्ह करा / प्रिंट करा (Save as PDF)
    </button>
  </div>
  <div class="page">
    <div class="masthead">
      <h1>NEXVARTA</h1>
      <p style="font-weight: bold; color: #ea580c; margin-top: 4px;">The Next Voice of News • महाराष्ट्र व पुण्याचे अग्रगण्य डिजिटल वृत्तपत्र</p>
    </div>
    <div class="bar">
      <span>${editionTitle}</span>
      <span>${date}</span>
      <span>पृष्ठ: १ (मुख्य पान) • एकूण पृष्ठे: ८</span>
      <span>मूल्य: मोफत डिजिटल</span>
    </div>
    <div class="headline">पुणे मेट्रो ३ चे लोकार्पण: हिंजवडी-शिवाजीनगर प्रवास आता अवघ्या १५ मिनिटांवर!</div>
    <div class="subhead">दररोज २ लाख आयटी कर्मचाऱ्यांना दिलासा; बाणेर, वाकड, पाषाणचा प्रवास अतिजलद</div>
    <div class="grid">
      <div class="image-box">
        <div>
          <h3>🚆 PUNE METRO 3 EXCLUSIVE</h3>
          <p style="font-size: 12px; opacity: 0.8; margin-top: 6px;">हिंजवडी मेट्रो स्थानकावर दाखल झालेली पहिली ट्रेन</p>
          <span style="background: #ea580c; font-size: 11px; padding: 2px 8px; border-radius: 3px; font-weight: bold;">🔴 NEXVARTA VERIFIED</span>
        </div>
      </div>
      <div style="font-size: 14px; line-height: 1.6; color: #334155;">
        <strong>पुणे:</strong> बहुप्रतिक्षित हिंजवडी ते शिवाजीनगर मेट्रो मार्ग ३ आजपासून प्रवाशांच्या सेवेत अधिकृतपणे दाखल झाली आहे. २३ किलोमीटर लांबीचा हा उन्नत मार्ग असून त्यावर २३ आधुनिक मेट्रो स्थानके उभारण्यात आली आहेत. यामुळे दररोज सकाळी व संध्याकाळी होणारी भीषण वाहतूक कोंडी इतिहासजमा होणार आहे.
      </div>
    </div>
    <div class="cols3">
      <div>
        <h4 style="color: #1d4ed8; margin-bottom: 6px;">चांद्रयान-४ मोहिमेची घोषणा</h4>
        <p style="font-size: 13px; color: #475569; line-height: 1.5;">केंद्रीय मंत्रिमंडळाने ₹२,१०४ कोटी मंजूर केले. चंद्रावरून मातीचे नमुने पृथ्वीवर आणणार.</p>
      </div>
      <div>
        <h4 style="color: #10b981; margin-bottom: 6px;">महाराष्ट्र औद्योगिक धोरण</h4>
        <p style="font-size: 13px; color: #475569; line-height: 1.5;">एमएसएमई उद्योगांना ५ लाखांपर्यंत बिनव्याजी कर्ज, १० लाख नव्या नोकऱ्यांचे उद्दिष्ट.</p>
      </div>
      <div>
        <h4 style="color: #7c3aed; margin-bottom: 6px;">गणेशोत्सवात AI सुरक्षा</h4>
        <p style="font-size: 13px; color: #475569; line-height: 1.5;">पुण्यात २,००० मंडळांची तयारी; १२,००० सीसीटीव्ही व ड्रोनद्वारे गर्दी नियंत्रण सज्ज.</p>
      </div>
    </div>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `inline; filename="Nexvarta_EPaper_${edition}_${date}.html"`,
    },
  });
}
