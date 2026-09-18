/**
 * Nexvarta E-Paper Engine & True Multi-Page PDF Generator
 * Outputs valid ISO 32000 %PDF-1.4 files containing multiple pages
 * Supports complete 4-Page Broadsheet edition (Front Page, Pune City, Maharashtra, Sports & Editorial)
 */

function base64ToUint8Array(base64) {
  const raw = atob(base64);
  const uint8Array = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    uint8Array[i] = raw.charCodeAt(i);
  }
  return uint8Array;
}

/**
 * Builds a genuine multi-page ISO %PDF-1.4 document from an array of JPEG byte arrays
 */
function createMultiPagePdf(pageList) {
  const pagePtWidth = 595.28; // standard A4 pt
  const pagePtHeight = 841.89;
  const numPages = pageList.length;

  const enc = new TextEncoder();
  const header = `%PDF-1.4\n%âãÏÓ\n`;
  const headerBytes = enc.encode(header);

  // Catalog: Obj 1
  const obj1 = `1 0 obj\n<<\n  /Type /Catalog\n  /Pages 2 0 R\n>>\nendobj\n`;
  const obj1Bytes = enc.encode(obj1);

  // Pages Root: Obj 2
  // Page Kids will be obj index: 3, 6, 9, 12, ... (3 + i*3)
  const kidsArray = [];
  for (let i = 0; i < numPages; i++) {
    kidsArray.push(`${3 + i * 3} 0 R`);
  }
  const obj2 = `2 0 obj\n<<\n  /Type /Pages\n  /Kids [${kidsArray.join(' ')}]\n  /Count ${numPages}\n>>\nendobj\n`;
  const obj2Bytes = enc.encode(obj2);

  // Collect all page objects
  const pageObjsBytes = [];
  for (let i = 0; i < numPages; i++) {
    const pageIndex = i + 1;
    const pageObjNum = 3 + i * 3;
    const imgObjNum = 4 + i * 3;
    const contentObjNum = 5 + i * 3;

    const pageObj = `${pageObjNum} 0 obj\n<<\n  /Type /Page\n  /Parent 2 0 R\n  /MediaBox [0 0 ${pagePtWidth} ${pagePtHeight}]\n  /Resources <<\n    /XObject <<\n      /Im${pageIndex} ${imgObjNum} 0 R\n    >>\n  >>\n  /Contents ${contentObjNum} 0 R\n>>\nendobj\n`;
    pageObjsBytes.push(enc.encode(pageObj));

    const item = pageList[i];
    const imgPrefix = `${imgObjNum} 0 obj\n<<\n  /Type /XObject\n  /Subtype /Image\n  /Width ${item.width}\n  /Height ${item.height}\n  /ColorSpace /DeviceRGB\n  /BitsPerComponent 8\n  /Filter /DCTDecode\n  /Length ${item.jpegBytes.length}\n>>\nstream\n`;
    const imgSuffix = `\nendstream\nendobj\n`;
    pageObjsBytes.push(enc.encode(imgPrefix));
    pageObjsBytes.push(item.jpegBytes);
    pageObjsBytes.push(enc.encode(imgSuffix));

    const contentStream = `q\n${pagePtWidth} 0 0 ${pagePtHeight} 0 0 cm\n/Im${pageIndex} Do\nQ\n`;
    const contentStreamBytes = enc.encode(contentStream);
    const contentObj = `${contentObjNum} 0 obj\n<<\n  /Length ${contentStreamBytes.length}\n>>\nstream\n${contentStream}endstream\nendobj\n`;
    pageObjsBytes.push(enc.encode(contentObj));
  }

  // Calculate offsets for xref table
  const totalObjs = 2 + (numPages * 3);
  const offsets = [0]; // offset for obj 0 is 0

  let currentOffset = headerBytes.length;
  offsets.push(currentOffset); // Obj 1 Catalog
  currentOffset += obj1Bytes.length;

  offsets.push(currentOffset); // Obj 2 Pages Root
  currentOffset += obj2Bytes.length;

  // Track each page, img, and content obj offset
  for (let i = 0; i < numPages; i++) {
    // page obj
    offsets.push(currentOffset);
    currentOffset += pageObjsBytes[i * 5].length;

    // img obj
    offsets.push(currentOffset);
    currentOffset += pageObjsBytes[i * 5 + 1].length + pageObjsBytes[i * 5 + 2].length + pageObjsBytes[i * 5 + 3].length;

    // content obj
    offsets.push(currentOffset);
    currentOffset += pageObjsBytes[i * 5 + 4].length;
  }

  const startXref = currentOffset;
  const pad10 = (n) => n.toString().padStart(10, '0');

  let xref = `xref\n0 ${totalObjs + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= totalObjs; i++) {
    xref += `${pad10(offsets[i])} 00000 n \n`;
  }
  xref += `trailer\n<<\n  /Size ${totalObjs + 1}\n  /Root 1 0 R\n>>\nstartxref\n${startXref}\n%%EOF\n`;
  const xrefBytes = enc.encode(xref);

  const totalLength = startXref + xrefBytes.length;
  const pdfBuffer = new Uint8Array(totalLength);

  let cur = 0;
  pdfBuffer.set(headerBytes, cur); cur += headerBytes.length;
  pdfBuffer.set(obj1Bytes, cur); cur += obj1Bytes.length;
  pdfBuffer.set(obj2Bytes, cur); cur += obj2Bytes.length;

  for (const part of pageObjsBytes) {
    pdfBuffer.set(part, cur);
    cur += part.length;
  }

  pdfBuffer.set(xrefBytes, cur);
  return pdfBuffer;
}

/**
 * Draw BroadSheet Page on Canvas by Page Number (1 to 4)
 */
export function drawEPaperCanvas({
  edition = 'pune',
  date = '१३ सप्टेंबर २०२६',
  pageNumber = 1
}) {
  const canvas = document.createElement('canvas');
  const width = 1240;
  const height = 1754; // A4 standard 150 DPI
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const editionLabel = edition === 'mumbai' ? 'मुंबई मुख्य आवृत्ती (Mumbai Edition)'
                     : edition === 'maharashtra' ? 'महाराष्ट्र राज्य आवृत्ती (State Edition)'
                     : 'पुणे मुख्य आवृत्ती (Pune Main Edition)';

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Outer Border
  ctx.strokeStyle = '#002255';
  ctx.lineWidth = 6;
  ctx.strokeRect(18, 18, width - 36, height - 36);

  // Header Blue Bar
  ctx.fillStyle = '#003884';
  ctx.fillRect(22, 22, width - 44, 42);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`NEXVARTA OFFICIAL DIGITAL E-PAPER • ${editionLabel.toUpperCase()}`, 40, 48);

  ctx.textAlign = 'right';
  ctx.fillText(`दिनांक: ${date} • पृष्ठ ${pageNumber} / ४`, width - 40, 48);

  // Masthead Section
  ctx.fillStyle = '#002255';
  ctx.font = '900 82px serif';
  ctx.textAlign = 'center';
  ctx.fillText('NEXVARTA', width / 2, 145);

  const pageNames = [
    'मुख्य पान (Front Page)',
    'पुणे नगर व परिसर (Pune City & Civic)',
    'महाराष्ट्र व देश (Maharashtra & Governance)',
    'क्रीडा, तंत्रज्ञान व संपादकीय (Sports & Editorial)'
  ];

  ctx.fillStyle = '#ea580c';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText(`The Next Voice of News • पृष्ठ ${pageNumber}: ${pageNames[pageNumber - 1]}`, width / 2, 182);

  // Double Line
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(35, 202);
  ctx.lineTo(width - 35, 202);
  ctx.stroke();

  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(35, 207);
  ctx.lineTo(width - 35, 207);
  ctx.stroke();

  // Edition Information Bar
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(35, 214, width - 70, 34);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`${editionLabel} | ${date} | पृष्ठ: ${pageNumber} | RNI क्र. MAHMAR/2024/89124 | मूल्य: ₹० (डिजिटल फ्री)`, 50, 237);

  // Weather & Financial Ticker Bar
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(35, 256, width - 70, 32);

  ctx.fillStyle = '#334155';
  ctx.font = 'bold 13.5px sans-serif';
  ctx.fillText('🌤️ पुणे: २८°C | मुंबई: ३०°C | 📈 सेन्सेक्स: ८४,२५० ▲ | 💰 सोने: ₹७६,८०० | ⛽ पेट्रोल: ₹१०४.२० / लिटर | 🌾 हवामान अंदाज: समाधानकारक', 48, 277);

  // PAGE CONTENT CUSTOMIZATION BY PAGE NUMBER:
  if (pageNumber === 1) {
    // ==========================================
    // PAGE 1: FRONT PAGE (मुख्य पान)
    // ==========================================
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(40, 305, 180, 28);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('महा-प्रकल्प लोकार्पण', 130, 324);

    ctx.fillStyle = '#0f172a';
    ctx.font = '900 36px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('पुणे मेट्रो ३ चे लोकार्पण: हिंजवडी-शिवाजीनगर प्रवास', 40, 375);
    ctx.fillText('आता अवघ्या १५ मिनिटांवर; वाहतूक कोंडीतून मुक्ती!', 40, 420);

    ctx.fillStyle = '#475569';
    ctx.font = 'bold 19px sans-serif';
    ctx.fillText('दररोज २ लाख आयटी कर्मचाऱ्यांना मोठा दिलासा • २३ किमी मार्ग व २३ स्थानके सुरू', 40, 458);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(40, 485, 560, 350);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🚆 PUNE METRO LINE 3 EXCLUSIVE', 320, 640);
    ctx.font = '15px sans-serif';
    ctx.fillText('हिंजवडी मेट्रो स्थानकावर दाखल झालेली पहिली हाय-स्पीड ट्रेन', 320, 672);

    ctx.fillStyle = 'rgba(234, 88, 12, 0.95)';
    ctx.fillRect(40, 795, 560, 40);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('🔴 NEXVARTA EXCLUSIVE PHOTO / FOOTAGE • VERIFIED', 320, 821);

    ctx.fillStyle = '#1e293b';
    ctx.font = '17px sans-serif';
    ctx.textAlign = 'left';
    const lead1 = [
      'पुणे: बहुप्रतिक्षित हिंजवडी ते शिवाजीनगर मेट्रो मार्ग ३ आजपासून',
      'प्रवाशांच्या सेवेत अधिकृतपणे दाखल झाली आहे. २३ किलोमीटर',
      'लांबीचा हा उन्नत मार्ग असून त्यावर २३ आधुनिक मेट्रो स्थानके',
      'उभारण्यात आली आहेत.',
      '',
      'या मेट्रोमुळे दररोज सकाळी व संध्याकाळी होणारी भीषण वाहतूक',
      'कोंडी कायमची इतिहासजमा होणार असून, पूर्वीचा दीड तासांचा',
      'प्रवास अवघ्या १५ ते १८ मिनिटांवर आला आहे.',
      '',
      'मेट्रो स्थानकांपासून हिंजवडी आयटी पार्कच्या कंपन्यांपर्यंत',
      'थेट इलेक्ट्रिक फीडर बस सेवाही एकाच वेळी कार्यान्वित झाली आहे.'
    ];
    lead1.forEach((line, idx) => ctx.fillText(line, 625, 515 + (idx * 27)));

    // Divider
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, 860);
    ctx.lineTo(width - 40, 860);
    ctx.stroke();

    // 3 Columns
    const cols = [
      {
        tag: 'इस्रो अंतराळ मोहीम',
        color: '#1d4ed8',
        title: 'चांद्रयान-४ ची रूपरेषा जाहीर;\nचंद्रावरून नमुने आणणार',
        body: 'केंद्रीय मंत्रिमंडळाने ₹२,१०४ कोटी मंजूर केले. LVM3 रॉकेट आणि स्वदेशी रोव्हर दक्षिण ध्रुवावर उतरणार. मानवी मोहिमेची पायाभरणी सुरू.'
      },
      {
        tag: 'महाराष्ट्र औद्योगिक धोरण',
        color: '#10b981',
        title: 'एमएसएमई उद्योगांना\n५ लाखांपर्यंत बिनव्याजी कर्ज',
        body: '१० लाख नव्या नोकऱ्यांचे उद्दिष्ट. वीज सवलत, महिला उद्योजकांसाठी विशेष प्रोत्साहन निधी योजना आणि क्लस्टर विकासाला गती.'
      },
      {
        tag: 'गणेशोत्सव २०२६ सुरक्षा',
        color: '#7c3aed',
        title: 'पुण्यात २,००० मंडळांची तयारी;\nAI कॅमेऱ्यांद्वारे सुरक्षा',
        body: '१,२०० हाय-डेफिनिशन कॅमेरे आणि गर्दी नियंत्रणासाठी ड्रोन मॉनिटरिंग ग्रिड कार्यान्वित करण्यात आली. विसर्जन मिरवणुकीची जय्यत तयारी.'
      }
    ];

    cols.forEach((col, idx) => {
      const colX = 40 + (idx * 390);
      ctx.fillStyle = col.color;
      ctx.fillRect(colX, 885, 170, 26);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(col.tag, colX + 85, 903);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 21px sans-serif';
      ctx.textAlign = 'left';
      col.title.split('\n').forEach((l, lIdx) => ctx.fillText(l, colX, 942 + (lIdx * 26)));

      ctx.fillStyle = '#475569';
      ctx.font = '15.5px sans-serif';
      ctx.fillText(col.body.substring(0, 36), colX, 1010);
      ctx.fillText(col.body.substring(36, 74), colX, 1034);
      ctx.fillText(col.body.substring(74, 114), colX, 1058);

      if (idx < 2) {
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(colX + 370, 880);
        ctx.lineTo(colX + 370, 1120);
        ctx.stroke();
      }
    });

    // Secondary Headline
    ctx.fillStyle = '#002255';
    ctx.fillRect(40, 1150, width - 80, 85);
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('💡 डिजिटल इंडियाला १० वर्षे पूर्ण: ग्रामीण भागात ९८% हाय-स्पीड इंटरनेट कनेक्टिव्हिटी', 60, 1186);
    ctx.fillStyle = '#ffffff';
    ctx.font = '15px sans-serif';
    ctx.fillText('देशातील ६ लाख खेड्यांमध्ये ऑप्टिकल फायबर जाळे पोहोचले असून ग्रामपंचायतींमध्ये डिजिटल सेवांचे प्रमाण ३००% वाढले आहे.', 60, 1214);

    // Bottom Editorial Box
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(40, 1255, width - 80, 340);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.strokeRect(40, 1255, width - 80, 340);
    ctx.fillStyle = '#003884';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('📝 नेक्सवार्ता अग्रलेख: महाराष्ट्राच्या विकासाची नवी मेट्रो गती', 60, 1290);
    ctx.fillStyle = '#334155';
    ctx.font = '15.5px sans-serif';
    const ed = [
      'पुणे आणि पिंपरी-चिंचवड हे देशाचे अग्रगण्य औद्योगिक आणि आयटी इंजिन आहे. मेट्रो ३ च्या रूपाने मिळालेली',
      'ही वेगवान कनेक्टिव्हिटी केवळ वाहतुकीचा प्रश्न सोडवत नसून लाखो नागरिकांच्या जीवनमानात आमूलाग्र बदल घडवणारी आहे.',
      'नागरिकांचा रस्त्यावरील वेळ वाचल्यास कौटुंबिक स्वास्थ्य आणि कामाची उत्पादकता दोन्ही सुधारते.',
      'आता गरज आहे ती सुरक्षित फीडर नेटवर्क आणि सायकल मार्गांची, जेणेकरून प्रदूषणमुक्त पुण्याचे स्वप्न साकार होईल.'
    ];
    ed.forEach((el, ei) => ctx.fillText(el, 60, 1325 + (ei * 26)));

    ctx.fillStyle = '#ecfdf5';
    ctx.fillRect(60, 1445, 340, 42);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(60, 1445, 340, 42);
    ctx.fillStyle = '#047857';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('✓ अधिकृत डिजिटल पडताळणीकृत ई-पेपर', 75, 1472);

  } else if (pageNumber === 2) {
    // ==========================================
    // PAGE 2: PUNE CITY & HYPERLOCAL (पुणे नगर व परिसर)
    // ==========================================
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(40, 305, 190, 28);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('पुणे महापालिका व रस्ते विकास', 135, 324);

    ctx.fillStyle = '#0f172a';
    ctx.font = '900 36px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('पुणे रिंग रोड आणि चांदणी चौक भुयारी मार्ग', 40, 375);
    ctx.fillText('काम अंतिम टप्प्यात; नोव्हेंबरपासून सर्व वाहनांसाठी खुला!', 40, 420);

    ctx.fillStyle = '#475569';
    ctx.font = 'bold 19px sans-serif';
    ctx.fillText('पश्चिम आणि पूर्व पुण्याचे अंतर ४० मिनिटांवर येणार • अवजड वाहनांना शहराबाहेरूनच मार्ग', 40, 458);

    // 2 Column Section
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(40, 485, 560, 350);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.strokeRect(40, 485, 560, 350);

    ctx.fillStyle = '#003884';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('💼 हिंजवडी फेज-३: ५,००० नव्या तंत्रज्ञान नोकऱ्या', 60, 525);

    ctx.fillStyle = '#334155';
    ctx.font = '16px sans-serif';
    const techJobs = [
      'एमआयडीसी आणि हिंजवडी इंडस्ट्रीज असोसिएशनच्या संयुक्त विद्यमाने',
      'फेज-३ मध्ये नवीन एआय लॅब्स आणि डेटा सायन्स पार्कचे काम पूर्ण झाले आहे.',
      'चार नामांकित बहुराष्ट्रीय कंपन्या पुढील २ महिन्यांत कॅम्पस रिक्रूटमेंट सुरू',
      'करणार असून ५,००० कुशल अभियंत्यांना थेट रोजगार मिळणार आहे.',
      'विद्यापीठातील फ्रेशर्ससाठी विशेष प्रशिक्षण शिष्यवृत्ती जाहीर.'
    ];
    techJobs.forEach((l, i) => ctx.fillText(l, 60, 565 + (i * 28)));

    // Right Column: Civic News
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(630, 485, 570, 350);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('🌊 मुळा-मुठा नदी संवर्धन प्रकल्प', 655, 525);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '16px sans-serif';
    const river = [
      'जायका (JICA) प्रकल्पांतर्गत शहरातील ११ सांडपाणी प्रक्रिया प्रकल्प (STP)',
      'ऑक्टोबरअखेर पूर्ण क्षमतेने सुरू होत आहेत.',
      'नदी पात्रात सोडले जाणारे ९०% सांडपाणी शुद्ध केले जाणार असून',
      'नदीकाठ संवर्धन व सायकल ट्रॅकचे काम युद्धपातळीवर सुरू आहे.',
      'पुणे महापालिकेचा हरित पुढाकार: जलचरांचे संवर्धन होणार.'
    ];
    river.forEach((l, i) => ctx.fillText(l, 655, 565 + (i * 28)));

    // Bottom Grid for Pune local
    const puneStories = [
      { title: 'पुणे विद्यापीठ: AI पदवी सुरू', desc: 'एसपीपीयूच्या नवीन बी.टेक अभ्यासक्रमास भरघोस प्रतिसाद. १२० जागांसाठी पहिली प्रवेश यादी जाहीर.' },
      { title: 'हडपसर: ५०० खाटांचे रुग्णालय', desc: 'पूर्व पुण्यासाठी अत्याधुनिक रोबोटिक सर्जरी व कॅन्सर केअर युनिटचे लोकार्पण.' },
      { title: 'पीएमपीएमएल: २०० नव्या ई-बसेस', desc: 'मेट्रो स्टेशनसाठी सकाळी ६ ते रात्री ११ पर्यंत दर ५ मिनिटांना वातानुकूलित फीडर बसेस.' }
    ];
    puneStories.forEach((st, i) => {
      const sx = 40 + (i * 390);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(st.title, sx, 890);
      ctx.fillStyle = '#475569';
      ctx.font = '15px sans-serif';
      ctx.fillText(st.desc.substring(0, 35), sx, 925);
      ctx.fillText(st.desc.substring(35, 75), sx, 950);
    });

  } else if (pageNumber === 3) {
    // ==========================================
    // PAGE 3: MAHARASHTRA & NATIONAL (महाराष्ट्र व देश)
    // ==========================================
    ctx.fillStyle = '#10b981';
    ctx.fillRect(40, 305, 190, 28);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('महाराष्ट्र राज्य धोरण', 135, 324);

    ctx.fillStyle = '#0f172a';
    ctx.font = '900 36px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('शेतकऱ्यांना मोठा दिलासा: कर्जमाफी टप्पा २ जाहीर;', 40, 375);
    ctx.fillText('१२ लाख शेतकऱ्यांच्या खात्यात थेट लाभ जमा!', 40, 420);

    ctx.fillStyle = '#475569';
    ctx.font = 'bold 19px sans-serif';
    ctx.fillText('पीक कर्ज आणि नैसर्गिक आपत्ती अनुदान थेट डीबीटीद्वारे वर्ग • १ ऑक्टोबरपासून वितरण', 40, 458);

    // Expressway Box
    ctx.fillStyle = '#002255';
    ctx.fillRect(40, 485, width - 80, 160);
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('🛣️ मुंबई-पुणे एक्सप्रेसवे "मिसिंग लिंक" बोगद्याचे काम पूर्ण; ३० मिनिटे वाचणार!', 65, 535);
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px sans-serif';
    const missingLink = [
      'खोपोली ते कुसगाव दरम्यानचा आशियातील सर्वात रुंद बोगदा आता अंतिम चाचणी टप्प्यात आहे.',
      'या प्रकल्पामुळे खंडाळा घाटातील अवघड वळणे आणि दरडी कोसळण्याचा धोका पूर्णपणे टळणार असून',
      'पुणे ते नवी मुंबई प्रवास अवघ्या ६५ मिनिटांवर येईल. दिवाळीपूर्वी अधिकृत लोकार्पण होणार.'
    ];
    missingLink.forEach((l, i) => ctx.fillText(l, 65, 575 + (i * 26)));

    // Other State Stories
    const stateCols = [
      { tag: 'विदर्भ-मराठवाडा', title: 'समृद्धी महामार्गावर नवीन लॉजिस्टिक हब', body: 'जालना व वर्धा येथे ड्राय पोर्ट आणि कोल्ड स्टोरेज पार्क उभारणीसाठी ₹३,५०० कोटींची गुंतवणूक मंजूर.' },
      { tag: 'शिक्षण सुधारणा', title: 'नवीन शैक्षणिक धोरण: कौशल्य केंद्रांची स्थापना', body: 'शालेय स्तरापासून कोडिंग आणि व्यावसायिक शिक्षण बंधनकारक; ५,००० डिजिटल लॅब्स सज्ज.' },
      { tag: 'ऊर्जा स्वावलंबन', title: 'सौर कृषी वाहिनी: दिवसा शेतकऱ्यांना मोफत वीज', body: 'राज्यात २५,००० मेगावॅट सौर ऊर्जेची जोडणी; शेतकऱ्यांना दिवसा अखंडित १० तास वीज पुरवठा.' }
    ];
    stateCols.forEach((col, i) => {
      const cx = 40 + (i * 390);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(cx, 680, 150, 24);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(col.tag, cx + 75, 696);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(col.title.substring(0, 25), cx, 735);
      ctx.fillText(col.title.substring(25), cx, 760);

      ctx.fillStyle = '#475569';
      ctx.font = '15px sans-serif';
      ctx.fillText(col.body.substring(0, 36), cx, 800);
      ctx.fillText(col.body.substring(36, 75), cx, 825);
      ctx.fillText(col.body.substring(75), cx, 850);
    });

  } else {
    // ==========================================
    // PAGE 4: SPORTS, TECH & EDITORIAL (क्रीडा व संपादकीय)
    // ==========================================
    ctx.fillStyle = '#d97706';
    ctx.fillRect(40, 305, 180, 28);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('क्रीडा विशेष वृत्त', 130, 324);

    ctx.fillStyle = '#0f172a';
    ctx.font = '900 36px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('आयपीएल २०२७ मेगा लिलाव: ऋषभ पंतने मोडला विक्रम!', 40, 375);
    ctx.fillText('३२ कोटी रुपयांच्या विक्रमी बोलीसह मुंबई इंडियन्सकडे करारबद्ध', 40, 420);

    ctx.fillStyle = '#475569';
    ctx.font = 'bold 19px sans-serif';
    ctx.fillText('आयपीएल इतिहासातील आजवरचा सर्वात महागडा खेळाडू • १५ देशांतील खेळाडूंवर कोट्यवधींचा पाऊस', 40, 458);

    // Tech Breakthrough
    ctx.fillStyle = '#002255';
    ctx.fillRect(40, 490, 560, 340);
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('⚡ टाटा मोटर्सचा पुण्यात मोठा शोध', 60, 530);
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px sans-serif';
    const tata = [
      'टाटा टेक्नॉलॉजीजच्या पुणे संशोधन केंद्रात १० मिनिटांत चार्ज',
      'होणारी सॉलिड-स्टेट ईव्ही बॅटरी विकसित करण्यात आली आहे.',
      'या बॅटरीमुळे एका चार्जवर १,००० किलोमीटरची रेंज मिळेल',
      'आणि बॅटरीचे आयुष्यमान १५ वर्षांपेक्षा अधिक राहील.',
      '२०२७ मध्ये पहिली व्यावसायिक कार रस्त्यावर धावणार.'
    ];
    tata.forEach((l, i) => ctx.fillText(l, 60, 570 + (i * 28)));

    // Shooting Gold
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(630, 490, 570, 340);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.strokeRect(630, 490, 570, 340);
    ctx.fillStyle = '#ea580c';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('🎯 पुणेकर नेमबाजाचा आंतरराष्ट्रीय सुवर्णवेध', 655, 530);
    ctx.fillStyle = '#334155';
    ctx.font = '16px sans-serif';
    const shoot = [
      'बालेवाडी क्रीडा संकुलातील नेमबाज वेदांत कुलकर्णीने वर्ल्ड कप स्पर्धेत',
      '१० मीटर एअर रायफल प्रकारात विश्वविक्रमासह सुवर्णपदक पटकावले.',
      'पुणे महापालिका व क्रीडा संचनालयातर्फे २५ लाखांचे बक्षीस जाहीर.',
      'आगामी ऑलिम्पिक स्पर्धेसाठी थेट पात्रता निश्चित.'
    ];
    shoot.forEach((l, i) => ctx.fillText(l, 655, 570 + (i * 28)));
  }

  // Footer bar on every page
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(35, 1680);
  ctx.lineTo(width - 35, 1680);
  ctx.stroke();

  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`संपादक: प्रशांत पाटील | आर.एन.आय. क्र.: MAHMAR/2024/89124 | पृष्ठ ${pageNumber} / ४`, 40, 1712);

  ctx.textAlign = 'right';
  ctx.fillText('अधिकृत डिजिटल ई-पेपर • www.nexvarta.com • © २०२६ सर्व हक्क सुरक्षित', width - 40, 1712);

  return canvas;
}

/**
 * Generates and downloads the COMPLETE 4-Page PDF document
 * Uses jsPDF for genuine multi-page .pdf binary generation and cross-browser file-saver
 */
export async function downloadEPaperPDF({
  edition = 'pune',
  date = '१३ सप्टेंबर २०२६',
  dateSlug = '13-Sep-2026',
  fullEdition = true,
  pageNumber = 1
}) {
  if (typeof window === 'undefined') return;

  const pagesToRender = fullEdition ? [1, 2, 3, 4] : [pageNumber];
  const editionName = edition === 'mumbai' ? 'Mumbai' : edition === 'maharashtra' ? 'Maharashtra' : 'Pune';
  const suffix = fullEdition ? 'Full_4Pages' : `Page_${pageNumber}`;
  const filename = `Nexvarta_EPaper_${editionName}_${dateSlug}_${suffix}.pdf`;

  try {
    const { jsPDF } = await import('jspdf');
    // Standard A4 dimensions in pt: 595.28 x 841.89
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
      compress: true
    });

    pagesToRender.forEach((pNum, index) => {
      if (index > 0) {
        doc.addPage('a4', 'portrait');
      }
      const canvas = drawEPaperCanvas({ edition, date, pageNumber: pNum });
      if (canvas) {
        const imgData = canvas.toDataURL('image/jpeg', 0.88);
        doc.addImage(imgData, 'JPEG', 0, 0, 595.28, 841.89, undefined, 'FAST');
      }
    });

    doc.save(filename);
    return true;
  } catch (err) {
    console.warn('Falling back to direct binary PDF download:', err);
    // Fallback using pure binary PDF generator
    const pageList = [];
    for (const pNum of pagesToRender) {
      const canvas = drawEPaperCanvas({ edition, date, pageNumber: pNum });
      if (canvas) {
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        const base64Data = dataUrl.split(',')[1];
        pageList.push({
          jpegBytes: base64ToUint8Array(base64Data),
          width: canvas.width,
          height: canvas.height
        });
      }
    }

    if (pageList.length === 0) return;
    const pdfBytes = createMultiPagePdf(pageList);

    // Crucial: Use application/octet-stream so browsers never replace with a GUID or open in-place
    const blob = new Blob([pdfBytes], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 4000);
    return true;
  }
}


/**
 * Open Print Window for Vector A4 Broadsheet
 */
export function openEPaperPrintWindow({ edition = 'pune', date = '१३ सप्टेंबर २०२६' }) {
  if (typeof window === 'undefined') return;

  const printWindow = window.open('', '_blank', 'width=950,height=1200');
  if (!printWindow) {
    alert('कृपया पॉप-अप ब्लॉकर तपासा आणि परवानगी द्या!');
    return;
  }

  const editionName = edition === 'mumbai' ? 'मुंबई मुख्य आवृत्ती (Mumbai Edition)' 
                    : edition === 'maharashtra' ? 'महाराष्ट्र राज्य आवृत्ती (State Edition)'
                    : 'पुणे मुख्य आवृत्ती (Pune Main Edition)';

  const htmlContent = `
<!DOCTYPE html>
<html lang="mr">
<head>
  <meta charset="UTF-8">
  <title>NEXVARTA E-Paper - ${editionName} - ${date}</title>
  <style>
    @page { size: A4 portrait; margin: 8mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #fff; color: #111; padding: 16px; }
    .page { max-width: 850px; margin: 0 auto 30px; border: 2px solid #002255; padding: 20px; page-break-after: always; }
    .page:last-child { page-break-after: avoid; }
    .masthead { text-align: center; border-bottom: 3px double #000; padding-bottom: 12px; margin-bottom: 8px; }
    .masthead h1 { font-size: 3.8rem; font-weight: 900; color: #002255; letter-spacing: 2px; line-height: 1; }
    .masthead p { font-weight: bold; color: #ea580c; font-size: 1rem; margin-top: 4px; text-transform: uppercase; }
    .info-bar { display: flex; justify-content: space-between; border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 5px 0; font-weight: bold; font-size: 0.85rem; margin-bottom: 12px; background: #f8fafc; }
    .headline { font-size: 2.1rem; font-weight: 900; color: #0f172a; margin: 12px 0 6px; line-height: 1.25; }
    .subhead { font-size: 1.1rem; font-weight: 700; color: #475569; margin-bottom: 14px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 16px; }
    .img-box { background: #0f172a; color: #fff; height: 230px; display: flex; align-items: center; justify-content: center; text-align: center; border-radius: 4px; }
    .cols3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; border-top: 2px solid #000; padding-top: 16px; margin-top: 16px; }
    @media print {
      .no-print { display: none !important; }
      body { padding: 0; }
      .page { border: none; padding: 0; }
    }
  </style>
</head>
<body>
  <div style="text-align: center; margin-bottom: 16px;" class="no-print">
    <button onclick="window.print()" style="background: #003884; color: #fff; padding: 12px 28px; font-size: 16px; font-weight: bold; border-radius: 8px; cursor: pointer; border: none; box-shadow: 0 4px 12px rgba(0,56,132,0.3);">
      🖨️ संपूर्ण ४-पानी PDF सेव्ह करा / प्रिंट करा (Save Full 4-Page PDF)
    </button>
  </div>

  <!-- Page 1: Main Front Page -->
  <div class="page">
    <div class="masthead">
      <h1>NEXVARTA</h1>
      <p>The Next Voice of News • पृष्ठ १: मुख्य पान</p>
    </div>
    <div class="info-bar">
      <span>${editionName}</span>
      <span>${date}</span>
      <span>पृष्ठ १ / ४ (मुख्य पान)</span>
      <span>किंमत: मोफत (डिजिटल)</span>
    </div>
    <div class="headline">पुणे मेट्रो ३ चे लोकार्पण: हिंजवडी-शिवाजीनगर प्रवास आता अवघ्या १५ मिनिटांवर!</div>
    <div class="subhead">दररोज २ लाख आयटी कर्मचाऱ्यांना वाहतूक कोंडीतून दिलासा; बाणेर, वाकड, पाषाणचा प्रवास अतिजलद</div>
    <div class="grid">
      <div class="img-box">
        <div>
          <h3 style="font-size: 1.3rem; margin-bottom: 6px;">🚆 PUNE METRO 3 EXCLUSIVE</h3>
          <p style="font-size: 0.85rem; opacity: 0.8;">हिंजवडी मेट्रो स्थानकावर दाखल झालेली पहिली ट्रेन</p>
          <span style="background: #ea580c; font-size: 0.75rem; padding: 3px 8px; border-radius: 3px; font-weight: bold; display: inline-block; margin-top: 8px;">🔴 NEXVARTA VERIFIED</span>
        </div>
      </div>
      <div style="font-size: 0.95rem; line-height: 1.65; color: #334155;">
        <strong>पुणे:</strong> बहुप्रतिक्षित हिंजवडी ते शिवाजीनगर मेट्रो मार्ग ३ आजपासून प्रवाशांच्या सेवेत अधिकृतपणे दाखल झाली आहे. २३ किलोमीटर लांबीचा हा उन्नत मार्ग असून त्यावर २३ आधुनिक मेट्रो स्थानके उभारण्यात आली आहेत. या मेट्रोमुळे दररोज सकाळी व संध्याकाळी होणारी भीषण वाहतूक कोंडी कायमची इतिहासजमा होणार असून, पूर्वीचा दीड तासांचा प्रवास अवघ्या १५ ते १८ मिनिटांवर आला आहे.
      </div>
    </div>
    <div class="cols3">
      <div>
        <h4 style="color: #1d4ed8; margin-bottom: 6px; font-size: 1.1rem;">चांद्रयान-४ मोहिमेची घोषणा</h4>
        <p style="font-size: 0.85rem; color: #475569; line-height: 1.5;">केंद्रीय मंत्रिमंडळाने ₹२,१०४ कोटी मंजूर केले. चंद्रावरून मातीचे नमुने आणणार.</p>
      </div>
      <div>
        <h4 style="color: #10b981; margin-bottom: 6px; font-size: 1.1rem;">महाराष्ट्र औद्योगिक धोरण</h4>
        <p style="font-size: 0.85rem; color: #475569; line-height: 1.5;">एमएसएमई उद्योगांना ५ लाखांपर्यंत बिनव्याजी कर्ज, १० लाख नव्या नोकऱ्यांचे उद्दिष्ट.</p>
      </div>
      <div>
        <h4 style="color: #7c3aed; margin-bottom: 6px; font-size: 1.1rem;">गणेशोत्सवात AI सुरक्षा</h4>
        <p style="font-size: 0.85rem; color: #475569; line-height: 1.5;">पुण्यात २,००० मंडळांची तयारी; १२,००० सीसीटीव्ही कॅमेरे व ड्रोनद्वारे गर्दी नियंत्रण सज्ज.</p>
      </div>
    </div>
  </div>

  <!-- Page 2: Pune City -->
  <div class="page">
    <div class="masthead">
      <h1>NEXVARTA</h1>
      <p>पुणे नगर व परिसर • पृष्ठ २ / ४</p>
    </div>
    <div class="info-bar">
      <span>${editionName}</span>
      <span>${date}</span>
      <span>पृष्ठ २: पुणे विशेष</span>
      <span>मूल्य: मोफत</span>
    </div>
    <div class="headline">पुणे रिंग रोड आणि चांदणी चौक भुयारी मार्ग काम अंतिम टप्प्यात; नोव्हेंबरपासून खुला</div>
    <div class="subhead">पश्चिम व पूर्व पुण्याचे अंतर ४० मिनिटांवर येणार; अवजड वाहने शहराबाहेरून वळवणार</div>
    <div class="grid">
      <div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 16px; border-radius: 6px;">
        <h3 style="color: #003884; margin-bottom: 8px;">💼 हिंजवडी फेज-३: ५००० नव्या आयटी नोकऱ्या</h3>
        <p style="font-size: 0.9rem; color: #334155; line-height: 1.6;">एमआयडीसीने नवीन एआय लॅबचे काम पूर्ण केले आहे. चार आघाडीच्या कंपन्या पुढील २ महिन्यांत कॅम्पस ड्राइव्ह सुरू करणार असून फ्रेशर्सना मोठ्या संधी उपलब्ध होणार आहेत.</p>
      </div>
      <div style="background: #0f172a; color: #fff; padding: 16px; border-radius: 6px;">
        <h3 style="color: #60a5fa; margin-bottom: 8px;">🌊 मुळा-मुठा नदी संवर्धन प्रकल्प</h3>
        <p style="font-size: 0.9rem; color: #cbd5e1; line-height: 1.6;">जायका प्रकल्पांतर्गत ११ सांडपाणी प्रक्रिया प्रकल्प कार्यान्वित होत असून नदीचे ९०% पाणी शुद्ध केले जाईल. नदीकाठ सायकल ट्रॅकचे काम प्रगतीपथावर.</p>
      </div>
    </div>
  </div>

  <!-- Page 3: Maharashtra & State -->
  <div class="page">
    <div class="masthead">
      <h1>NEXVARTA</h1>
      <p>महाराष्ट्र राज्य व देश • पृष्ठ ३ / ४</p>
    </div>
    <div class="info-bar">
      <span>${editionName}</span>
      <span>${date}</span>
      <span>पृष्ठ ३: राज्य विशेष</span>
      <span>मूल्य: मोफत</span>
    </div>
    <div class="headline">शेतकऱ्यांना मोठा दिलासा: कर्जमाफी टप्पा २ जाहीर; १२ लाख शेतकऱ्यांना लाभ</div>
    <div class="subhead">पीक कर्ज व आपत्ती अनुदान थेट बँक खात्यात वर्ग होणार • १ ऑक्टोबरपासून वितरण सुरू</div>
    <div style="background: #002255; color: #fff; padding: 20px; border-radius: 8px; margin-bottom: 16px;">
      <h3 style="color: #fde047; margin-bottom: 8px;">🛣️ मुंबई-पुणे एक्सप्रेसवे 'मिसिंग लिंक' बोगद्याचे काम पूर्ण; ३० मिनिटे वाचणार!</h3>
      <p style="font-size: 0.95rem; line-height: 1.6;">आशियातील सर्वात रुंद बोगदा अंतिम टप्प्यात असून दिवाळीपूर्वी लोकार्पण होणार आहे. खंडाळा घाटातील भीषण वाहतूक कोंडी कायमची टळणार.</p>
    </div>
  </div>

  <!-- Page 4: Sports & Editorial -->
  <div class="page">
    <div class="masthead">
      <h1>NEXVARTA</h1>
      <p>क्रीडा, तंत्रज्ञान व संपादकीय • पृष्ठ ४ / ४</p>
    </div>
    <div class="info-bar">
      <span>${editionName}</span>
      <span>${date}</span>
      <span>पृष्ठ ४: क्रीडा व संपादकीय</span>
      <span>मूल्य: मोफत</span>
    </div>
    <div class="headline">आयपीएल २०२७ मेगा लिलाव: ऋषभ पंत ३२ कोटी रुपयांना मुंबई इंडियन्सकडे!</div>
    <div class="subhead">आयपीएल इतिहासातील सर्वकालीन विक्रम मोडीत • १५ देशांतील खेळाडूंवर कोट्यवधींचा वर्षाव</div>
    <div class="grid">
      <div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 16px; border-radius: 6px;">
        <h3 style="color: #003884; margin-bottom: 8px;">📝 नेक्सवार्ता अग्रलेख</h3>
        <p style="font-size: 0.9rem; color: #334155; line-height: 1.6;">महाराष्ट्राच्या मेट्रो क्रांतीमुळे शहरांचे सक्षमीकरण होत आहे. प्रदूषणमुक्त सार्वजनिक वाहतूक हीच शाश्वत विकासाची गुरुकिल्ली आहे.</p>
      </div>
      <div style="background: #002255; color: #fff; padding: 16px; border-radius: 6px;">
        <h3 style="color: #fde047; margin-bottom: 8px;">⚡ टाटा मोटर्सचा सॉलिड-स्टेट बॅटरी शोध</h3>
        <p style="font-size: 0.9rem; color: #cbd5e1; line-height: 1.6;">पुण्यात विकसित झाली १० मिनिटांत चार्ज होणारी १००० किमी रेंज देणारी बॅटरी. २०२७ मध्ये पहिली कार बाजारात येणार.</p>
      </div>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
