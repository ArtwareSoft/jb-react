dsl('zui')

component('zuiTest.healthCare.conditionIconBox', {
  doNotRunInTests: true,
  impl: zuiTest({
    control: itemlist({
      items: '%$testData%',
      itemControl: healthCare.conditionIconBox(),
      itemsLayout: grid([20,20], xyByProps('urgency', 'likelihood', { normalized: true }), {
        initialZoom: 20,
        center: [10,10]
      })
    }),
    testData: healthCare.conditionDataSample300(),
    htmlMode: true
  })
})

component('healthCare.conditionDataSample', {
  impl: () => [
      { "title": "Appendicitis", "category": "Gastrointestinal", "urgency": 9, "likelihood": 6, "abrv": "APN"},
      { "title": "Diverticulitis", "category": "Gastrointestinal", "urgency": 7, "likelihood": 5, "abrv": "DVRT"},
      { "title": "Myocardial Infarction", "category": "Cardiovascular", "urgency": 10, "likelihood": 8, "abrv": "MI"},
      { "title": "Migraine Headache", "category": "Neurological", "urgency": 6, "likelihood": 7, "abrv": "MH"},
      { "title": "Pneumonia", "category": "Respiratory", "urgency": 6, "likelihood": 6, "abrv": "PNU"},
      { "title": "Asthma Exacerbation", "category": "Respiratory", "urgency": 7, "likelihood": 5, "abrv": "ASTH"},
      { "title": "Stroke", "category": "Neurological", "urgency": 10, "likelihood": 7, "abrv": "STRK"},
      { "title": "Hypertensive Crisis", "category": "Cardiovascular", "urgency": 9, "likelihood": 6, "abrv": "HTNC"},
      { "title": "Gallstones", "category": "Gastrointestinal", "urgency": 5, "likelihood": 4, "abrv": "GLST"},
      { "title": "Seizure", "category": "Neurological", "urgency": 8, "likelihood": 5, "abrv": "SZR"}
    ]
})

component('healthCare.conditionIconBox', {
  type: 'control',
  impl: iconBox('%abrv%', itemSymbol(healthCare.categorySymbol()), {
    style: healthCare.conditionIconBoxStyle({
      urgencySymbol: symbol(unitScale('urgency'), list('⚠️','❗','')),
      borderStyle: borderStyle(unitScale('likelihood')),
      opacity: opacity(unitScale('likelihood')),
      borderColor: itemColor(unitScale('urgency'), list('green','orange','red')),
      categoryColor: healthCare.categoryColor()
    })
  })
})

component('healthCare.conditionIconBoxStyle', {
  type: 'iconBox-style',
  params: [
    {id: 'urgencySymbol', type: 'item_symbol', byName: true},
    {id: 'borderStyle', type: 'item_border_style'},
    {id: 'opacity', type: 'item_opacity'},
    {id: 'borderColor', type: 'item_color'},
    {id: 'categoryColor', type: 'item_color'}
  ],
  impl: features(
    zoomingSize(fill()),
    frontEnd.method('zoomingCss', (ctx,{cmp,itemSize}) => {
      const boxSize = 2 ** Math.floor(Math.log(itemSize[0]+0.1)/Math.log(2))
      const cssVars = {}
      cssVars['border-width'] = `${Math.min(2,Math.max(0,jb.zui.floorLog2(boxSize)-3))}px`
      cssVars['box-size'] = `${boxSize}px`
      if (boxSize >= 16) {
        cssVars['symbol-font-size'] = `${boxSize * 0.5}px`
        cssVars['urgency-symbol-font-size'] = `${boxSize * 0.25}px`
        cssVars['urgency-symbol-offset'] = `${boxSize / 16}px`
        cssVars['abrv-font-size'] = `${boxSize * 0.25}px`
        cssVars['abrv-margin'] = `${boxSize / 16}px`
      } else {
        cssVars['symbol-font-size'] = `0px`
        cssVars['urgency-symbol-font-size'] = `0px`
        cssVars['urgency-symbol-offset'] = `0px`
        cssVars['abrv-font-size'] = `0px`
        cssVars['abrv-margin'] = `0px`
      }
      jb.zui.setCssVars(`icon-${cmp.id}`,cssVars)
    }),
    htmlOfItem(`<div class="icon-%$cmp/id%" style="opacity: %$opacity()%; border-style: %$borderStyle()%; border-color: %$borderColor()%; font-family: Arial, sans-serif;">
      <div class="icon-background-%$cmp/id%" style="background-color: %$categoryColor()%"></div>
      <div class="icon-content-%$cmp/id%">
        <div class="icon-urgencySymbol-%$cmp/id%">%$urgencySymbol()%</div>
        <div class="icon-main-symbol-%$cmp/id%">%$$model/mainSymbol()%</div>
        <div class="icon-abrv-%$cmp/id%">%$$model/abrv()%</div>
      </div>
    </div>`),
    css(`
      .icon-%$cmp/id% { position: relative; border-width: var(--border-width); width: var(--box-size); height: var(--box-size);}
      .icon-background-%$cmp/id% { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 50%; }
      .icon-content-%$cmp/id% { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; }
      .icon-urgencySymbol-%$cmp/id% { position: absolute; top: var(--urgency-symbol-offset); right: var(--urgency-symbol-offset); font-size: var(--urgency-symbol-font-size); }
      .icon-main-symbol-%$cmp/id% { font-size: var(--symbol-font-size); line-height: 1; }
      .icon-abrv-%$cmp/id% { font-size: var(--abrv-font-size); margin: var(--abrv-margin); line-height: 1; }
    `)
  )
})


// component('healthCare.conditionIconBoxStyle', {
//   type: 'iconBox-style',
//   params: [
//     {id: 'urgencySymbol', type: 'item_symbol', byName: true},
//     {id: 'borderStyle', type: 'item_border_style'},
//     {id: 'borderColor', type: 'item_color'},
//     {id: 'categoryColor', type: 'item_color'}
//   ],
//   impl: features(
//     zoomingSize(fill()),
//     frontEnd.method('zoomingCss', (ctx,{cmp,itemSize}) => {
//         const boxSize = 2**Math.floor(Math.log(itemSize[0]+0.1)/Math.log(2))
//         const symbolFontSize = boxSize >= 16 ? boxSize * 0.5 : 0
//         const urgencySymbolFontSize = boxSize >= 16 ? boxSize * 0.25 : 0
//         const urgencySymbolTopRight = boxSize >= 16 ? boxSize / 16 : 0
//         const abrvFontSize = boxSize >= 16 ? boxSize * 0.25 : 0
//         const abrvMargin = boxSize >= 16 ? boxSize / 16 : 0
//         const borderWidth = Math.max(0,jb.zui.floorLog2(boxSize)-3)
//         const fontsSizeSum = symbolFontSize+urgencySymbolFontSize+2*abrvMargin
//         console.log(itemSize[0],boxSize,symbolFontSize)

//       jb.zui.setCss(`dynamic-${cmp.clz}`,`
//       .icon-${cmp.id} { border-width: ${borderWidth}px; }
//       .icon-urgencySymbol-${cmp.id} { font-size: ${urgencySymbolFontSize}px;top: ${urgencySymbolTopRight}px; right: ${urgencySymbolTopRight}px }
//       .icon-main-symbol-${cmp.id} { font-size: ${symbolFontSize}px; }
//       .icon-abrv-${cmp.id} { font-size: ${abrvFontSize}px; margin: ${abrvMargin}px }
//       .icon-content-${cmp.id} { top: -${fontsSizeSum*0.3}px; left: -${fontsSizeSum*0.3}px }
//       ` )
//     }),
//     htmlOfItem(`<div class="icon-%$cmp/id%" style="border-style: %$borderStyle()%; border-color: %$borderColor()%;">
//     <div class="icon-background-%$cmp/id%" style="background-color: %$categoryColor()%"></div>
//     <div class="icon-content-%$cmp/id%">
//       <div class="icon-urgencySymbol-%$cmp/id%">%$urgencySymbol()%</div>
//       <div class="icon-main-symbol-%$cmp/id%">%$$model/mainSymbol()%</div>
//       <div class="icon-abrv-%$cmp/id%">%$$model/abrv()%</div>
//     </div>
//   </div>`),
//     css(`
//     .icon-%$cmp/id% { position: relative; font-family: Arial, sans-serif; }
//       .icon-background-%$cmp/id% { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 50%; }
//       .icon-content-%$cmp/id% { position: absolute; text-align: center; }
//       .icon-urgencySymbol-%$cmp/id% { position: absolute; }
//       .icon-main-symbol-%$cmp/id% { line-height: 1; }
//       .icon-abrv-%$cmp/id% { line-height: 1; }      
//     `)
//   )
// })

component('healthCare.categorySymbol', {
  type: 'item_symbol',
  impl: symbolByItemValue({
    value: '%category%',
    case: [
      Case('Cardiovascular', '🫀'),
      Case('Neurological', '🧠'),
      Case('Respiratory', '🌬️'),
      Case('Gastrointestinal', '🍴'),
      Case('Musculoskeletal', '🦴'),
      Case('Endocrine', '🕰️'),
      Case('Infectious Disease', '🦠'),
      Case('Dermatological', '🩹'),
      Case('Psychiatric', '💭'),
      Case('Hematological', '🩸'),
      Case('Nephrological', '🚰'),
      Case('Oncological', '🎗️'),
      Case('Ophthalmological', '👁️'),
      Case('Otolaryngological', '👂'),
      Case('Immunological', '🛡️'),
      Case('Rheumatological', '🤲'),
      Case('Gynecological', '👩‍⚕️'),
      Case('Urological', '🚽'),
      Case('Pediatric', '🧸'),
      Case('Geriatric', '👴👵'),
      Case('Emergency Medicine', '🚨'),
      Case('Allergy', '🤧'),
      Case('Psychological', '🧘'),
      Case('Dental', '🦷'),
      Case('Radiological', '📡')
    ]
  })
})

component('healthCare.categoryColor', {
  type: 'item_color',
  impl: colorByItemValue({
    value: '%category%',
    case: [
      Case('Cardiovascular', 'red'),
      Case('Neurological', 'blue'),
      Case('Respiratory', 'green'),
      Case('Gastrointestinal', 'orange'),
      Case('Musculoskeletal', 'purple'),
      Case('Endocrine', 'yellow'),
      Case('Infectious Disease', 'darkred'),
      Case('Dermatological', 'pink'),
      Case('Psychiatric', 'brown'),
      Case('Hematological', 'maroon'),
      Case('Nephrological', 'teal'),
      Case('Oncological', 'black'),
      Case('Ophthalmological', 'lightblue'),
      Case('Otolaryngological', 'navy'),
      Case('Immunological', 'olive'),
      Case('Rheumatological', 'violet'),
      Case('Gynecological', 'magenta'),
      Case('Urological', 'cyan'),
      Case('Pediatric', 'lightgreen'),
      Case('Geriatric', 'slategray'),
      Case('Emergency Medicine', 'crimson'),
      Case('Allergy', 'gold'),
      Case('Psychological', 'saddlebrown'),
      Case('Dental', 'tan'),
      Case('Radiological', 'silver')
    ],
    defaultColor: 'gray'
  })
})

component('healthCare.conditionDataSample300', {
  impl: () => [
        { "title": "Appendicitis", "category": "Gastrointestinal", "urgency": 9, "likelihood": 6, "abrv": "APN" },
        { "title": "Diverticulitis", "category": "Gastrointestinal", "urgency": 7, "likelihood": 5, "abrv": "DVRT" },
        { "title": "Myocardial Infarction", "category": "Cardiovascular", "urgency": 10, "likelihood": 8, "abrv": "MI" },
        { "title": "Migraine Headache", "category": "Neurological", "urgency": 6, "likelihood": 7, "abrv": "MH" },
        { "title": "Pneumonia", "category": "Respiratory", "urgency": 6, "likelihood": 6, "abrv": "PNU" },
        { "title": "Asthma Exacerbation", "category": "Respiratory", "urgency": 7, "likelihood": 5, "abrv": "ASTH" },
        { "title": "Stroke", "category": "Neurological", "urgency": 10, "likelihood": 7, "abrv": "STRK" },
        { "title": "Hypertensive Crisis", "category": "Cardiovascular", "urgency": 9, "likelihood": 6, "abrv": "HTNC" },
        { "title": "Gallstones", "category": "Gastrointestinal", "urgency": 5, "likelihood": 4, "abrv": "GLST" },
        { "title": "Seizure", "category": "Neurological", "urgency": 8, "likelihood": 5, "abrv": "SZR" },
        { "title": "Deep Vein Thrombosis", "category": "Cardiovascular", "urgency": 7, "likelihood": 5, "abrv": "DVT" },
        { "title": "Cholecystitis", "category": "Gastrointestinal", "urgency": 8, "likelihood": 5, "abrv": "CHOLC" },
        { "title": "Epilepsy", "category": "Neurological", "urgency": 5, "likelihood": 6, "abrv": "EPI" },
        { "title": "Chronic Obstructive Pulmonary Disease", "category": "Respiratory", "urgency": 6, "likelihood": 7, "abrv": "COPD" },
        { "title": "Hypertension", "category": "Cardiovascular", "urgency": 4, "likelihood": 9, "abrv": "HTN" },
        { "title": "Peptic Ulcer Disease", "category": "Gastrointestinal", "urgency": 5, "likelihood": 7, "abrv": "PUD" },
        { "title": "Multiple Sclerosis", "category": "Neurological", "urgency": 5, "likelihood": 4, "abrv": "MS" },
        { "title": "Bronchitis", "category": "Respiratory", "urgency": 4, "likelihood": 8, "abrv": "BRN" },
        { "title": "Atrial Fibrillation", "category": "Cardiovascular", "urgency": 7, "likelihood": 6, "abrv": "AFib" },
        { "title": "Irritable Bowel Syndrome", "category": "Gastrointestinal", "urgency": 3, "likelihood": 8, "abrv": "IBS" },
        { "title": "Parkinson's Disease", "category": "Neurological", "urgency": 5, "likelihood": 3, "abrv": "PD" },
        { "title": "Acute Bronchiolitis", "category": "Respiratory", "urgency": 6, "likelihood": 5, "abrv": "ABR" },
        { "title": "Heart Failure", "category": "Cardiovascular", "urgency": 8, "likelihood": 7, "abrv": "HF" },
        { "title": "Gastritis", "category": "Gastrointestinal", "urgency": 4, "likelihood": 6, "abrv": "GSTR" },
        { "title": "Alzheimer's Disease", "category": "Neurological", "urgency": 3, "likelihood": 4, "abrv": "AD" },
        { "title": "Upper Respiratory Tract Infection", "category": "Respiratory", "urgency": 4, "likelihood": 8, "abrv": "URTI" },
        { "title": "Coronary Artery Disease", "category": "Cardiovascular", "urgency": 7, "likelihood": 7, "abrv": "CAD" },
        { "title": "Liver Cirrhosis", "category": "Gastrointestinal", "urgency": 6, "likelihood": 5, "abrv": "LC" },
        { "title": "Epiglottitis", "category": "Respiratory", "urgency": 9, "likelihood": 4, "abrv": "EPI" },
        { "title": "Hypertension Stage 2", "category": "Cardiovascular", "urgency": 5, "likelihood": 8, "abrv": "HTN2" },
        { "title": "Appendicitis", "category": "Gastrointestinal", "urgency": 9, "likelihood": 6, "abrv": "APN" },
        { "title": "Migraine Headache", "category": "Neurological", "urgency": 6, "likelihood": 7, "abrv": "MH" },
        { "title": "Pneumonia", "category": "Respiratory", "urgency": 6, "likelihood": 6, "abrv": "PNU" },
        { "title": "Asthma Exacerbation", "category": "Respiratory", "urgency": 7, "likelihood": 5, "abrv": "ASTH" },
        { "title": "Stroke", "category": "Neurological", "urgency": 10, "likelihood": 7, "abrv": "STRK" },
        { "title": "Hypertensive Crisis", "category": "Cardiovascular", "urgency": 9, "likelihood": 6, "abrv": "HTNC" },
        { "title": "Gallstones", "category": "Gastrointestinal", "urgency": 5, "likelihood": 4, "abrv": "GLST" },
        { "title": "Seizure", "category": "Neurological", "urgency": 8, "likelihood": 5, "abrv": "SZR" },
        { "title": "Deep Vein Thrombosis", "category": "Cardiovascular", "urgency": 7, "likelihood": 5, "abrv": "DVT" },
        { "title": "Cholecystitis", "category": "Gastrointestinal", "urgency": 8, "likelihood": 5, "abrv": "CHOLC" },
        { "title": "Epilepsy", "category": "Neurological", "urgency": 5, "likelihood": 6, "abrv": "EPI" },
        { "title": "Chronic Obstructive Pulmonary Disease", "category": "Respiratory", "urgency": 6, "likelihood": 7, "abrv": "COPD" },
        { "title": "Hypertension", "category": "Cardiovascular", "urgency": 4, "likelihood": 9, "abrv": "HTN" },
        { "title": "Peptic Ulcer Disease", "category": "Gastrointestinal", "urgency": 5, "likelihood": 7, "abrv": "PUD" },
        { "title": "Multiple Sclerosis", "category": "Neurological", "urgency": 5, "likelihood": 4, "abrv": "MS" },
        { "title": "Bronchitis", "category": "Respiratory", "urgency": 4, "likelihood": 8, "abrv": "BRN" },
        { "title": "Atrial Fibrillation", "category": "Cardiovascular", "urgency": 7, "likelihood": 6, "abrv": "AFib" },
        { "title": "Irritable Bowel Syndrome", "category": "Gastrointestinal", "urgency": 3, "likelihood": 8, "abrv": "IBS" },
        { "title": "Parkinson's Disease", "category": "Neurological", "urgency": 5, "likelihood": 3, "abrv": "PD" },
        { "title": "Acute Bronchiolitis", "category": "Respiratory", "urgency": 6, "likelihood": 5, "abrv": "ABR" },
        { "title": "Heart Failure", "category": "Cardiovascular", "urgency": 8, "likelihood": 7, "abrv": "HF" },
        { "title": "Gastritis", "category": "Gastrointestinal", "urgency": 4, "likelihood": 6, "abrv": "GSTR" },
        { "title": "Alzheimer's Disease", "category": "Neurological", "urgency": 3, "likelihood": 4, "abrv": "AD" },
        { "title": "Upper Respiratory Tract Infection", "category": "Respiratory", "urgency": 4, "likelihood": 8, "abrv": "URTI" },
        { "title": "Coronary Artery Disease", "category": "Cardiovascular", "urgency": 7, "likelihood": 7, "abrv": "CAD" },
        { "title": "Liver Cirrhosis", "category": "Gastrointestinal", "urgency": 6, "likelihood": 5, "abrv": "LC" },
        { "title": "Epiglottitis", "category": "Respiratory", "urgency": 9, "likelihood": 4, "abrv": "EPI" },
        { "title": "Hypertension Stage 2", "category": "Cardiovascular", "urgency": 5, "likelihood": 8, "abrv": "HTN2" },
        { "title": "Anemia", "category": "Hematological", "urgency": 4, "likelihood": 7, "abrv": "ANA" },
        { "title": "Leukemia", "category": "Hematological", "urgency": 8, "likelihood": 4, "abrv": "LEU" },
        { "title": "Rheumatoid Arthritis", "category": "Rheumatological", "urgency": 6, "likelihood": 5, "abrv": "RA" },
        { "title": "Urinary Tract Infection", "category": "Urological", "urgency": 5, "likelihood": 8, "abrv": "UTI" },
        { "title": "Diabetes Mellitus Type 2", "category": "Endocrine", "urgency": 5, "likelihood": 9, "abrv": "DM2" },
        { "title": "Hyperthyroidism", "category": "Endocrine", "urgency": 6, "likelihood": 6, "abrv": "HTH" },
        { "title": "Hypothyroidism", "category": "Endocrine", "urgency": 4, "likelihood": 7, "abrv": "HTH" },
        { "title": "Sepsis", "category": "Infectious Disease", "urgency": 10, "likelihood": 5, "abrv": "SPS" },
        { "title": "Cellulitis", "category": "Dermatological", "urgency": 7, "likelihood": 6, "abrv": "CLLS" },
        { "title": "Psoriasis", "category": "Dermatological", "urgency": 4, "likelihood": 7, "abrv": "PSOR" },
        { "title": "Depression", "category": "Psychiatric", "urgency": 5, "likelihood": 8, "abrv": "DEPR" },
        { "title": "Bipolar Disorder", "category": "Psychiatric", "urgency": 6, "likelihood": 5, "abrv": "BPD" },
        { "title": "Hemophilia", "category": "Hematological", "urgency": 7, "likelihood": 3, "abrv": "HEMO" },
        { "title": "Chronic Kidney Disease", "category": "Nephrological", "urgency": 6, "likelihood": 7, "abrv": "CKD" },
        { "title": "Urinary Incontinence", "category": "Urological", "urgency": 4, "likelihood": 6, "abrv": "UI" },
        { "title": "Prostate Cancer", "category": "Oncological", "urgency": 8, "likelihood": 4, "abrv": "PCAN" },
        { "title": "Breast Cancer", "category": "Oncological", "urgency": 8, "likelihood": 5, "abrv": "BCAN" },
        { "title": "Cataract", "category": "Ophthalmological", "urgency": 5, "likelihood": 7, "abrv": "CAT" },
        { "title": "Glaucoma", "category": "Ophthalmological", "urgency": 7, "likelihood": 6, "abrv": "GLCM" },
        { "title": "Otitis Media", "category": "Otolaryngological", "urgency": 5, "likelihood": 8, "abrv": "OMI" },
        { "title": "Sinusitis", "category": "Otolaryngological", "urgency": 4, "likelihood": 7, "abrv": "SNST" },
        { "title": "Allergic Rhinitis", "category": "Allergy", "urgency": 4, "likelihood": 8, "abrv": "AR" },
        { "title": "Anaphylaxis", "category": "Allergy", "urgency": 10, "likelihood": 3, "abrv": "ANA" },
        { "title": "Immune Thrombocytopenic Purpura", "category": "Immunological", "urgency": 7, "likelihood": 4, "abrv": "ITP" },
        { "title": "Systemic Lupus Erythematosus", "category": "Immunological", "urgency": 6, "likelihood": 5, "abrv": "SLE" },
        { "title": "Ankylosing Spondylitis", "category": "Rheumatological", "urgency": 5, "likelihood": 4, "abrv": "AS" },
        { "title": "Gout", "category": "Rheumatological", "urgency": 7, "likelihood": 5, "abrv": "GOUT" },
        { "title": "Osteoarthritis", "category": "Musculoskeletal", "urgency": 4, "likelihood": 8, "abrv": "OA" },
        { "title": "Osteoporosis", "category": "Musculoskeletal", "urgency": 5, "likelihood": 6, "abrv": "OPH" },
        { "title": "Type 1 Diabetes Mellitus", "category": "Endocrine", "urgency": 8, "likelihood": 4, "abrv": "T1DM" },
        { "title": "Adrenal Insufficiency", "category": "Endocrine", "urgency": 7, "likelihood": 3, "abrv": "AI" },
        { "title": "HIV/AIDS", "category": "Infectious Disease", "urgency": 8, "likelihood": 4, "abrv": "HIV" },
        { "title": "Tuberculosis", "category": "Infectious Disease", "urgency": 7, "likelihood": 5, "abrv": "TB" },
        { "title": "Psoriatic Arthritis", "category": "Rheumatological", "urgency": 6, "likelihood": 5, "abrv": "PsA" },
        { "title": "Fibromyalgia", "category": "Musculoskeletal", "urgency": 4, "likelihood": 6, "abrv": "FM" },
        { "title": "Chronic Migraine", "category": "Neurological", "urgency": 5, "likelihood": 6, "abrv": "CM" },
        { "title": "Tension Headache", "category": "Neurological", "urgency": 3, "likelihood": 8, "abrv": "TH" },
        { "title": "Sinus Headache", "category": "Neurological", "urgency": 4, "likelihood": 7, "abrv": "SH" },
        { "title": "COVID-19", "category": "Infectious Disease", "urgency": 9, "likelihood": 6, "abrv": "COVID" },
        { "title": "Influenza", "category": "Infectious Disease", "urgency": 7, "likelihood": 7, "abrv": "FLU" },
        { "title": "Bacterial Meningitis", "category": "Infectious Disease", "urgency": 10, "likelihood": 3, "abrv": "BMN" },
        { "title": "Viral Hepatitis", "category": "Gastrointestinal", "urgency": 6, "likelihood": 5, "abrv": "VH" },
        { "title": "Celiac Disease", "category": "Gastrointestinal", "urgency": 5, "likelihood": 6, "abrv": "CELD" },
        { "title": "Hemorrhoids", "category": "Gastrointestinal", "urgency": 4, "likelihood": 7, "abrv": "HEM" },
        { "title": "Liver Cancer", "category": "Oncological", "urgency": 8, "likelihood": 4, "abrv": "LCAN" },
        { "title": "Colon Cancer", "category": "Oncological", "urgency": 8, "likelihood": 5, "abrv": "CCAN" },
        { "title": "Skin Infection", "category": "Dermatological", "urgency": 6, "likelihood": 7, "abrv": "SKINF" },
        { "title": "Eczema", "category": "Dermatological", "urgency": 4, "likelihood": 7, "abrv": "ECZ" },
        { "title": "Schizophrenia", "category": "Psychiatric", "urgency": 7, "likelihood": 4, "abrv": "SCHZ" },
        { "title": "Obsessive-Compulsive Disorder", "category": "Psychiatric", "urgency": 5, "likelihood": 6, "abrv": "OCD" },
        { "title": "Anxiety Disorder", "category": "Psychiatric", "urgency": 5, "likelihood": 9, "abrv": "ADIS" },
        { "title": "Post-Traumatic Stress Disorder", "category": "Psychiatric", "urgency": 6, "likelihood": 5, "abrv": "PTSD" },
        { "title": "Schizophreniform Disorder", "category": "Psychiatric", "urgency": 6, "likelihood": 3, "abrv": "SFD" },
        { "title": "Bipolar I Disorder", "category": "Psychiatric", "urgency": 7, "likelihood": 4, "abrv": "BPD1" },
        { "title": "Bipolar II Disorder", "category": "Psychiatric", "urgency": 6, "likelihood": 4, "abrv": "BPD2" },
        { "title": "Attention Deficit Hyperactivity Disorder", "category": "Psychiatric", "urgency": 4, "likelihood": 7, "abrv": "ADHD" },
        { "title": "Nightmare Disorder", "category": "Psychiatric", "urgency": 3, "likelihood": 6, "abrv": "NMD" },
        { "title": "Panic Disorder", "category": "Psychiatric", "urgency": 5, "likelihood": 7, "abrv": "PD" },
        { "title": "Bulimia Nervosa", "category": "Psychiatric", "urgency": 6, "likelihood": 5, "abrv": "BN" },
        { "title": "Anorexia Nervosa", "category": "Psychiatric", "urgency": 8, "likelihood": 4, "abrv": "AN" },
        { "title": "Dementia", "category": "Neurological", "urgency": 7, "likelihood": 5, "abrv": "DEM" },
        { "title": "Peripheral Neuropathy", "category": "Neurological", "urgency": 6, "likelihood": 6, "abrv": "PNP" },
        { "title": "Guillain-Barré Syndrome", "category": "Neurological", "urgency": 8, "likelihood": 3, "abrv": "GBS" },
        { "title": "Amyotrophic Lateral Sclerosis", "category": "Neurological", "urgency": 9, "likelihood": 2, "abrv": "ALS" },
        { "title": "Bell's Palsy", "category": "Neurological", "urgency": 5, "likelihood": 6, "abrv": "BP" },
        { "title": "Toxic Epidermal Necrolysis", "category": "Dermatological", "urgency": 10, "likelihood": 2, "abrv": "TEN" },
        { "title": "Stevens-Johnson Syndrome", "category": "Dermatological", "urgency": 10, "likelihood": 2, "abrv": "SJS" },
        { "title": "Vitiligo", "category": "Dermatological", "urgency": 3, "likelihood": 6, "abrv": "VTG" },
        { "title": "Erythroderma", "category": "Dermatological", "urgency": 7, "likelihood": 3, "abrv": "ERY" },
        { "title": "Atopic Dermatitis", "category": "Dermatological", "urgency": 5, "likelihood": 7, "abrv": "AD" },
        { "title": "Basal Cell Carcinoma", "category": "Oncological", "urgency": 6, "likelihood": 5, "abrv": "BCC" },
        { "title": "Squamous Cell Carcinoma", "category": "Oncological", "urgency": 7, "likelihood": 5, "abrv": "SCC" },
        { "title": "Malignant Melanoma", "category": "Oncological", "urgency": 8, "likelihood": 4, "abrv": "MM" },
        { "title": "Leukoplakia", "category": "Dental", "urgency": 5, "likelihood": 5, "abrv": "LEUK" },
        { "title": "Periodontitis", "category": "Dental", "urgency": 6, "likelihood": 6, "abrv": "PERIO" },
        { "title": "Dental Caries", "category": "Dental", "urgency": 4, "likelihood": 8, "abrv": "DC" },
        { "title": "Oral Thrush", "category": "Dental", "urgency": 5, "likelihood": 7, "abrv": "OT" },
        { "title": "Temporomandibular Joint Disorder", "category": "Dental", "urgency": 5, "likelihood": 5, "abrv": "TMJ" },
        { "title": "Dental Abscess", "category": "Dental", "urgency": 7, "likelihood": 6, "abrv": "DA" },
        { "title": "Halitosis", "category": "Dental", "urgency": 3, "likelihood": 7, "abrv": "HAL" },
        { "title": "Tooth Sensitivity", "category": "Dental", "urgency": 2, "likelihood": 8, "abrv": "TS" },
        { "title": "Enamel Erosion", "category": "Dental", "urgency": 4, "likelihood": 6, "abrv": "EE" },
        { "title": "Cavities", "category": "Dental", "urgency": 4, "likelihood": 8, "abrv": "CAV" },
        { "title": "Impacted Wisdom Tooth", "category": "Dental", "urgency": 6, "likelihood": 5, "abrv": "IWT" },
        { "title": "Orthodontic Malocclusion", "category": "Dental", "urgency": 3, "likelihood": 7, "abrv": "OML" },
        { "title": "Temporomandibular Joint Dysfunction", "category": "Dental", "urgency": 5, "likelihood": 6, "abrv": "TMJD" },
        { "title": "Xerostomia", "category": "Dental", "urgency": 4, "likelihood": 7, "abrv": "XERO" },
        { "title": "Dental Erosion", "category": "Dental", "urgency": 4, "likelihood": 6, "abrv": "DEN" },
        { "title": "Radiological Fracture", "category": "Radiological", "urgency": 7, "likelihood": 5, "abrv": "RAD-FX" },
        { "title": "Pulmonary Embolism", "category": "Cardiovascular", "urgency": 10, "likelihood": 4, "abrv": "PE" },
        { "title": "Acute Respiratory Distress Syndrome", "category": "Respiratory", "urgency": 10, "likelihood": 3, "abrv": "ARDS" },
        { "title": "Bronchopneumonia", "category": "Respiratory", "urgency": 7, "likelihood": 5, "abrv": "BPN" },
        { "title": "Chronic Kidney Disease Stage 3", "category": "Nephrological", "urgency": 5, "likelihood": 6, "abrv": "CKD3" },
        { "title": "Nephrolithiasis", "category": "Nephrological", "urgency": 7, "likelihood": 5, "abrv": "NL" },
        { "title": "Urinary Retention", "category": "Urological", "urgency": 8, "likelihood": 4, "abrv": "UR" },
        { "title": "Testicular Torsion", "category": "Urological", "urgency": 10, "likelihood": 2, "abrv": "TT" },
        { "title": "Benign Prostatic Hyperplasia", "category": "Urological", "urgency": 5, "likelihood": 7, "abrv": "BPH" },
        { "title": "Prostatitis", "category": "Urological", "urgency": 6, "likelihood": 5, "abrv": "PROC" },
        { "title": "Interstitial Cystitis", "category": "Urological", "urgency": 5, "likelihood": 4, "abrv": "IC" },
        { "title": "Kidney Stones", "category": "Nephrological", "urgency": 8, "likelihood": 6, "abrv": "KS" },
        { "title": "Polycystic Kidney Disease", "category": "Nephrological", "urgency": 6, "likelihood": 4, "abrv": "PKD" },
        { "title": "Chronic Liver Disease", "category": "Gastrointestinal", "urgency": 7, "likelihood": 5, "abrv": "CLD" },
        { "title": "Hepatic Encephalopathy", "category": "Gastrointestinal", "urgency": 9, "likelihood": 3, "abrv": "HE" },
        { "title": "Portal Hypertension", "category": "Gastrointestinal", "urgency": 8, "likelihood": 4, "abrv": "PH" },
        { "title": "Esophageal Varices", "category": "Gastrointestinal", "urgency": 9, "likelihood": 3, "abrv": "EV" },
        { "title": "Hepatitis C", "category": "Gastrointestinal", "urgency": 6, "likelihood": 5, "abrv": "HCV" },
        { "title": "Lymphoma", "category": "Oncological", "urgency": 8, "likelihood": 4, "abrv": "LYMP" },
        { "title": "Leukemia", "category": "Hematological", "urgency": 8, "likelihood": 4, "abrv": "LEU" },
        { "title": "Multiple Myeloma", "category": "Hematological", "urgency": 7, "likelihood": 3, "abrv": "MM" },
        { "title": "Sepsis", "category": "Infectious Disease", "urgency": 10, "likelihood": 5, "abrv": "SEP" },
        { "title": "Meningitis", "category": "Infectious Disease", "urgency": 10, "likelihood": 3, "abrv": "MEN" },
        { "title": "Endocarditis", "category": "Cardiovascular", "urgency": 8, "likelihood": 4, "abrv": "ENDO" },
        { "title": "Pericarditis", "category": "Cardiovascular", "urgency": 7, "likelihood": 5, "abrv": "PERI" },
        { "title": "Cardiomyopathy", "category": "Cardiovascular", "urgency": 7, "likelihood": 5, "abrv": "CMP" },
        { "title": "Valvular Heart Disease", "category": "Cardiovascular", "urgency": 6, "likelihood": 6, "abrv": "VHD" },
        { "title": "Aortic Dissection", "category": "Cardiovascular", "urgency": 10, "likelihood": 3, "abrv": "ADIS" },
        { "title": "Pericardial Effusion", "category": "Cardiovascular", "urgency": 7, "likelihood": 5, "abrv": "PEFF" },
        { "title": "Hypertrophic Cardiomyopathy", "category": "Cardiovascular", "urgency": 8, "likelihood": 4, "abrv": "HCM" },
        { "title": "Atherosclerosis", "category": "Cardiovascular", "urgency": 6, "likelihood": 7, "abrv": "ATH" },
        { "title": "Pulmonary Hypertension", "category": "Cardiovascular", "urgency": 7, "likelihood": 5, "abrv": "PH" },
        { "title": "Endometriosis", "category": "Gynecological", "urgency": 6, "likelihood": 5, "abrv": "ENDO" },
        { "title": "Polycystic Ovary Syndrome", "category": "Gynecological", "urgency": 5, "likelihood": 7, "abrv": "PCOS" },
        { "title": "Menorrhagia", "category": "Gynecological", "urgency": 6, "likelihood": 6, "abrv": "MENR" },
        { "title": "Ovarian Cyst", "category": "Gynecological", "urgency": 5, "likelihood": 6, "abrv": "OCY" },
        { "title": "Uterine Fibroids", "category": "Gynecological", "urgency": 5, "likelihood": 7, "abrv": "UF" },
        { "title": "Preeclampsia", "category": "Gynecological", "urgency": 9, "likelihood": 4, "abrv": "PREC" },
        { "title": "Ectopic Pregnancy", "category": "Gynecological", "urgency": 10, "likelihood": 3, "abrv": "ECP" },
        { "title": "Endometrial Cancer", "category": "Oncological", "urgency": 8, "likelihood": 4, "abrv": "ECAN" },
        { "title": "Breast Fibroadenoma", "category": "Oncological", "urgency": 6, "likelihood": 5, "abrv": "BFA" },
        { "title": "Thyroid Nodule", "category": "Endocrine", "urgency": 5, "likelihood": 7, "abrv": "THN" },
        { "title": "Hyperparathyroidism", "category": "Endocrine", "urgency": 7, "likelihood": 5, "abrv": "HPTH" },
        { "title": "Pheochromocytoma", "category": "Endocrine", "urgency": 9, "likelihood": 3, "abrv": "PHEO" },
        { "title": "Addison's Disease", "category": "Endocrine", "urgency": 7, "likelihood": 4, "abrv": "ADD" },
        { "title": "Cushing's Syndrome", "category": "Endocrine", "urgency": 8, "likelihood": 4, "abrv": "CUSH" },
        { "title": "Diabetic Ketoacidosis", "category": "Endocrine", "urgency": 9, "likelihood": 5, "abrv": "DKA" },
        { "title": "Hyperglycemic Hyperosmolar State", "category": "Endocrine", "urgency": 10, "likelihood": 4, "abrv": "HHS" },
        { "title": "Graves' Disease", "category": "Endocrine", "urgency": 7, "likelihood": 5, "abrv": "GD" },
        { "title": "Hashimoto's Thyroiditis", "category": "Endocrine", "urgency": 6, "likelihood": 6, "abrv": "HT" },
        { "title": "Adrenal Tumor", "category": "Endocrine", "urgency": 8, "likelihood": 3, "abrv": "ADTM" },
        { "title": "Thyroid Storm", "category": "Endocrine", "urgency": 10, "likelihood": 2, "abrv": "TS" },
        { "title": "Cushing's Disease", "category": "Endocrine", "urgency": 8, "likelihood": 4, "abrv": "CD" },
        { "title": "Primary Hyperaldosteronism", "category": "Endocrine", "urgency": 7, "likelihood": 5, "abrv": "PHA" },
        { "title": "Hypogonadism", "category": "Endocrine", "urgency": 5, "likelihood": 6, "abrv": "HYPOG" },
        { "title": "Osteoporosis", "category": "Musculoskeletal", "urgency": 5, "likelihood": 7, "abrv": "OPH" },
        { "title": "Rheumatoid Arthritis", "category": "Rheumatological", "urgency": 6, "likelihood": 5, "abrv": "RA" },
        { "title": "Systemic Lupus Erythematosus", "category": "Immunological", "urgency": 6, "likelihood": 5, "abrv": "SLE" },
        { "title": "Type 1 Diabetes Mellitus", "category": "Endocrine", "urgency": 8, "likelihood": 4, "abrv": "T1DM" },
        { "title": "Hemophilia", "category": "Hematological", "urgency": 7, "likelihood": 3, "abrv": "HEMO" },
        { "title": "Gout", "category": "Rheumatological", "urgency": 7, "likelihood": 5, "abrv": "GOUT" },
        { "title": "Mononucleosis", "category": "Infectious Disease", "urgency": 5, "likelihood": 6, "abrv": "MONO" },
        { "title": "Lyme Disease", "category": "Infectious Disease", "urgency": 7, "likelihood": 4, "abrv": "LYME" },
        { "title": "Scarlet Fever", "category": "Infectious Disease", "urgency": 6, "likelihood": 5, "abrv": "SCF" },
        { "title": "Dengue Fever", "category": "Infectious Disease", "urgency": 8, "likelihood": 3, "abrv": "DENF" },
        { "title": "Yellow Fever", "category": "Infectious Disease", "urgency": 9, "likelihood": 2, "abrv": "YFEV" },
        { "title": "Zika Virus Infection", "category": "Infectious Disease", "urgency": 7, "likelihood": 3, "abrv": "ZIKA" },
        { "title": "Chikungunya", "category": "Infectious Disease", "urgency": 7, "likelihood": 3, "abrv": "CHK" },
        { "title": "Hepatitis B", "category": "Gastrointestinal", "urgency": 7, "likelihood": 5, "abrv": "HBV" },
        { "title": "Gonorrhea", "category": "Infectious Disease", "urgency": 6, "likelihood": 6, "abrv": "GONO" },
        { "title": "Chlamydia", "category": "Infectious Disease", "urgency": 5, "likelihood": 7, "abrv": "CHML" },
        { "title": "Syphilis", "category": "Infectious Disease", "urgency": 7, "likelihood": 5, "abrv": "SYPH" },
        { "title": "Herpes Simplex Virus", "category": "Infectious Disease", "urgency": 6, "likelihood": 6, "abrv": "HSV" },
        { "title": "Varicella-Zoster Virus", "category": "Infectious Disease", "urgency": 7, "likelihood": 5, "abrv": "VZV" },
        { "title": "Hepatitis A", "category": "Gastrointestinal", "urgency": 6, "likelihood": 5, "abrv": "HAV" },
        { "title": "Rotavirus Infection", "category": "Infectious Disease", "urgency": 5, "likelihood": 7, "abrv": "RV" },
        { "title": "Norovirus Infection", "category": "Infectious Disease", "urgency": 6, "likelihood": 6, "abrv": "NV" },
        { "title": "AIDS-Related Complex", "category": "Infectious Disease", "urgency": 8, "likelihood": 3, "abrv": "ARC" },
        { "title": "Acute Lymphoblastic Leukemia", "category": "Hematological", "urgency": 8, "likelihood": 4, "abrv": "ALL" },
        { "title": "Acute Myeloid Leukemia", "category": "Hematological", "urgency": 9, "likelihood": 3, "abrv": "AML" },
        { "title": "Chronic Lymphocytic Leukemia", "category": "Hematological", "urgency": 7, "likelihood": 4, "abrv": "CLL" },
        { "title": "Hairy Cell Leukemia", "category": "Hematological", "urgency": 7, "likelihood": 3, "abrv": "HCL" },
        { "title": "Essential Thrombocythemia", "category": "Hematological", "urgency": 6, "likelihood": 4, "abrv": "ET" },
        { "title": "Polycythemia Vera", "category": "Hematological", "urgency": 7, "likelihood": 4, "abrv": "PV" },
        { "title": "Chronic Myeloid Leukemia", "category": "Hematological", "urgency": 8, "likelihood": 3, "abrv": "CML" },
        { "title": "Thrombocytopenia", "category": "Hematological", "urgency": 7, "likelihood": 5, "abrv": "TCP" },
        { "title": "Hemochromatosis", "category": "Hematological", "urgency": 6, "likelihood": 6, "abrv": "HCH" },
        { "title": "Sickle Cell Disease", "category": "Hematological", "urgency": 8, "likelihood": 3, "abrv": "SCD" },
        { "title": "Chronic Fatigue Syndrome", "category": "Psychological", "urgency": 5, "likelihood": 6, "abrv": "CFS" },
        { "title": "Insomnia", "category": "Psychological", "urgency": 4, "likelihood": 8, "abrv": "INS" },
        { "title": "Restless Legs Syndrome", "category": "Neurological", "urgency": 5, "likelihood": 6, "abrv": "RLS" },
        { "title": "Narcolepsy", "category": "Neurological", "urgency": 6, "likelihood": 4, "abrv": "NARCO" },
        { "title": "Vertigo", "category": "Neurological", "urgency": 5, "likelihood": 7, "abrv": "VERT" },
        { "title": "Bell's Palsy", "category": "Neurological", "urgency": 5, "likelihood": 6, "abrv": "BP" },
        { "title": "Myasthenia Gravis", "category": "Neurological", "urgency": 7, "likelihood": 4, "abrv": "MG" },
        { "title": "Carpal Tunnel Syndrome", "category": "Musculoskeletal", "urgency": 5, "likelihood": 7, "abrv": "CTS" },
        { "title": "Tendonitis", "category": "Musculoskeletal", "urgency": 5, "likelihood": 7, "abrv": "TEND" },
        { "title": "Bursitis", "category": "Musculoskeletal", "urgency": 5, "likelihood": 6, "abrv": "BUR" },
        { "title": "Scoliosis", "category": "Musculoskeletal", "urgency": 5, "likelihood": 6, "abrv": "SCOL" },
        { "title": "Fibromyalgia", "category": "Musculoskeletal", "urgency": 4, "likelihood": 6, "abrv": "FM" },
        { "title": "Osteomyelitis", "category": "Musculoskeletal", "urgency": 8, "likelihood": 4, "abrv": "OSTM" },
        { "title": "Lumbago", "category": "Musculoskeletal", "urgency": 5, "likelihood": 7, "abrv": "LUM" },
        { "title": "Sciatica", "category": "Musculoskeletal", "urgency": 6, "likelihood": 6, "abrv": "SCIAT" },
        { "title": "Ankylosing Spondylitis", "category": "Rheumatological", "urgency": 5, "likelihood": 4, "abrv": "AS" },
        { "title": "Temporomandibular Joint Disorder", "category": "Dental", "urgency": 5, "likelihood": 6, "abrv": "TMJ-DS" },
        { "title": "Carcinoid Syndrome", "category": "Oncological", "urgency": 7, "likelihood": 3, "abrv": "CS" },
        { "title": "Lung Cancer", "category": "Oncological", "urgency": 9, "likelihood": 4, "abrv": "LCAN" },
        { "title": "Pancreatic Cancer", "category": "Oncological", "urgency": 10, "likelihood": 3, "abrv": "PCAN" },
        { "title": "Renal Cell Carcinoma", "category": "Oncological", "urgency": 8, "likelihood": 4, "abrv": "RCC" },
        { "title": "Bladder Cancer", "category": "Oncological", "urgency": 8, "likelihood": 4, "abrv": "BLCA" },
        { "title": "Testicular Cancer", "category": "Oncological", "urgency": 9, "likelihood": 3, "abrv": "TC" },
        { "title": "Klinefelter Syndrome", "category": "Endocrine", "urgency": 5, "likelihood": 3, "abrv": "KSY" },
        { "title": "Turner Syndrome", "category": "Endocrine", "urgency": 5, "likelihood": 3, "abrv": "TSY" },
        { "title": "Kallmann Syndrome", "category": "Endocrine", "urgency": 6, "likelihood": 2, "abrv": "KLS" },
        { "title": "Prader-Willi Syndrome", "category": "Pediatric", "urgency": 7, "likelihood": 2, "abrv": "PWS" },
        { "title": "Williams Syndrome", "category": "Pediatric", "urgency": 6, "likelihood": 2, "abrv": "WLS" },
        { "title": "Autism Spectrum Disorder", "category": "Psychological", "urgency": 5, "likelihood": 7, "abrv": "ASD" },
        { "title": "Down Syndrome", "category": "Pediatric", "urgency": 6, "likelihood": 3, "abrv": "DS" },
        { "title": "Attention Deficit Disorder", "category": "Psychological", "urgency": 4, "likelihood": 8, "abrv": "ADD" },
        { "title": "Tourette Syndrome", "category": "Neurological", "urgency": 6, "likelihood": 4, "abrv": "TS" },
        { "title": "Fragile X Syndrome", "category": "Pediatric", "urgency": 5, "likelihood": 3, "abrv": "FXS" },
        { "title": "Marfan Syndrome", "category": "Musculoskeletal", "urgency": 7, "likelihood": 3, "abrv": "MFS" },
        { "title": "Ehlers-Danlos Syndrome", "category": "Musculoskeletal", "urgency": 7, "likelihood": 3, "abrv": "EDS" },
        { "title": "Hemangioma", "category": "Dermatological", "urgency": 4, "likelihood": 5, "abrv": "HGM" },
        { "title": "Vasculitis", "category": "Immunological", "urgency": 7, "likelihood": 4, "abrv": "VASC" },
        { "title": "Goodpasture Syndrome", "category": "Immunological", "urgency": 9, "likelihood": 2, "abrv": "GPS" },
        { "title": "Dermatomyositis", "category": "Immunological", "urgency": 8, "likelihood": 3, "abrv": "DM" },
        { "title": "Granulomatosis with Polyangiitis", "category": "Immunological", "urgency": 9, "likelihood": 2, "abrv": "GPA" },
        { "title": "Systemic Sclerosis", "category": "Immunological", "urgency": 7, "likelihood": 3, "abrv": "SS" },
        { "title": "Churg-Strauss Syndrome", "category": "Immunological", "urgency": 8, "likelihood": 2, "abrv": "CSS" },
        { "title": "Henoch-Schönlein Purpura", "category": "Immunological", "urgency": 8, "likelihood": 3, "abrv": "HSP" },
        { "title": "Lupus Nephritis", "category": "Immunological", "urgency": 8, "likelihood": 3, "abrv": "LN" },
        { "title": "Behçet's Disease", "category": "Immunological", "urgency": 7, "likelihood": 3, "abrv": "BD" },
        { "title": "IgA Nephropathy", "category": "Nephrological", "urgency": 7, "likelihood": 4, "abrv": "IgAN" },
        { "title": "Nephrotic Syndrome", "category": "Nephrological", "urgency": 7, "likelihood": 5, "abrv": "NS" },
        { "title": "Polycystic Liver Disease", "category": "Nephrological", "urgency": 5, "likelihood": 3, "abrv": "PLD" },
        { "title": "Acute Glomerulonephritis", "category": "Nephrological", "urgency": 8, "likelihood": 3, "abrv": "AGN" },
        { "title": "Chronic Glomerulonephritis", "category": "Nephrological", "urgency": 7, "likelihood": 4, "abrv": "CGN" },
        { "title": "Renal Artery Stenosis", "category": "Nephrological", "urgency": 8, "likelihood": 3, "abrv": "RAS" },
        { "title": "Renal Vein Thrombosis", "category": "Nephrological", "urgency": 9, "likelihood": 2, "abrv": "RVT" },
        { "title": "Nephrogenic Systemic Fibrosis", "category": "Nephrological", "urgency": 9, "likelihood": 2, "abrv": "NSF" },
        { "title": "Neurogenic Bladder", "category": "Urological", "urgency": 6, "likelihood": 4, "abrv": "NB" },
        { "title": "Interstitial Nephritis", "category": "Nephrological", "urgency": 7, "likelihood": 4, "abrv": "IN" },
        { "title": "Urethritis", "category": "Urological", "urgency": 6, "likelihood": 6, "abrv": "URETH" },
        { "title": "Prostatitis", "category": "Urological", "urgency": 6, "likelihood": 5, "abrv": "PROC" },
        { "title": "Nephroblastoma", "category": "Nephrological", "urgency": 8, "likelihood": 2, "abrv": "NW" },
        { "title": "Goodpasture Syndrome", "category": "Immunological", "urgency": 9, "likelihood": 2, "abrv": "GPS" },
        { "title": "Systemic Lupus Erythematosus", "category": "Immunological", "urgency": 6, "likelihood": 5, "abrv": "SLE" },
        { "title": "IgA Nephropathy", "category": "Nephrological", "urgency": 7, "likelihood": 4, "abrv": "IgAN" },
        { "title": "Xerophthalmia", "category": "Ophthalmological", "urgency": 6, "likelihood": 5, "abrv": "XTO" },
        { "title": "Retinopathy of Prematurity", "category": "Ophthalmological", "urgency": 8, "likelihood": 3, "abrv": "ROP" },
        { "title": "Glaucoma", "category": "Ophthalmological", "urgency": 7, "likelihood": 6, "abrv": "GLCM" },
        { "title": "Macular Degeneration", "category": "Ophthalmological", "urgency": 7, "likelihood": 5, "abrv": "MD" },
        { "title": "Conjunctivitis", "category": "Ophthalmological", "urgency": 5, "likelihood": 7, "abrv": "CONJ" },
        { "title": "Uveitis", "category": "Ophthalmological", "urgency": 7, "likelihood": 4, "abrv": "UVEI" },
        { "title": "Keratitis", "category": "Ophthalmological", "urgency": 8, "likelihood": 4, "abrv": "KER" },
        { "title": "Blepharitis", "category": "Ophthalmological", "urgency": 4, "likelihood": 6, "abrv": "BLEP" },
        { "title": "Glaucoma", "category": "Ophthalmological", "urgency": 7, "likelihood": 6, "abrv": "GLCM" },
        { "title": "Retinal Detachment", "category": "Ophthalmological", "urgency": 9, "likelihood": 3, "abrv": "RD" },
        { "title": "Optic Neuritis", "category": "Ophthalmological", "urgency": 8, "likelihood": 4, "abrv": "ON" },
        { "title": "Cataract", "category": "Ophthalmological", "urgency": 5, "likelihood": 7, "abrv": "CAT" },
        { "title": "Hyperopia", "category": "Ophthalmological", "urgency": 3, "likelihood": 8, "abrv": "HYP" },
        { "title": "Myopia", "category": "Ophthalmological", "urgency": 3, "likelihood": 8, "abrv": "MYO" },
        { "title": "Astigmatism", "category": "Ophthalmological", "urgency": 2, "likelihood": 9, "abrv": "ASTG" },
        { "title": "Presbyopia", "category": "Ophthalmological", "urgency": 2, "likelihood": 9, "abrv": "PRSP" },
        { "title": "Blepharoptosis", "category": "Ophthalmological", "urgency": 5, "likelihood": 6, "abrv": "BLEP-O" },
        { "title": "Strabismus", "category": "Ophthalmological", "urgency": 4, "likelihood": 7, "abrv": "STRB" },
        { "title": "Color Blindness", "category": "Ophthalmological", "urgency": 3, "likelihood": 8, "abrv": "CB" },
        { "title": "Amblyopia", "category": "Ophthalmological", "urgency": 6, "likelihood": 5, "abrv": "AMB" },
        { "title": "Flashes and Floaters", "category": "Ophthalmological", "urgency": 7, "likelihood": 5, "abrv": "FF" },
        { "title": "Ocular Hypertension", "category": "Ophthalmological", "urgency": 6, "likelihood": 6, "abrv": "OH" },
        { "title": "Dry Eye Syndrome", "category": "Ophthalmological", "urgency": 4, "likelihood": 7, "abrv": "DES" },
        { "title": "Biopsy Findings", "category": "Radiological", "urgency": 5, "likelihood": 5, "abrv": "BIOF" },
        { "title": "Fracture Detection", "category": "Radiological", "urgency": 7, "likelihood": 6, "abrv": "FRD" },
        { "title": "Radiological Osteoporosis", "category": "Radiological", "urgency": 6, "likelihood": 6, "abrv": "RAD-OPO" },
        { "title": "MRI Findings", "category": "Radiological", "urgency": 5, "likelihood": 5, "abrv": "MRI-F" },
        { "title": "CT Scan Findings", "category": "Radiological", "urgency": 6, "likelihood": 6, "abrv": "CT-F" },
        { "title": "Ultrasound Detection", "category": "Radiological", "urgency": 5, "likelihood": 7, "abrv": "US-D" },
        { "title": "X-Ray Abnormality", "category": "Radiological", "urgency": 6, "likelihood": 6, "abrv": "XRAY-A" },
        { "title": "Bone Density Low", "category": "Radiological", "urgency": 5, "likelihood": 7, "abrv": "BMD-LOW" },
        { "title": "Chest X-Ray Pneumonia", "category": "Radiological", "urgency": 7, "likelihood": 5, "abrv": "CXR-P" },
        { "title": "CT Angiography Findings", "category": "Radiological", "urgency": 8, "likelihood": 4, "abrv": "CT-A" },
        { "title": "Mammography Findings", "category": "Radiological", "urgency": 7, "likelihood": 5, "abrv": "MM-F" },
        { "title": "Echocardiogram Findings", "category": "Radiological", "urgency": 7, "likelihood": 5, "abrv": "ECHO-F" },
        { "title": "PET Scan Findings", "category": "Radiological", "urgency": 8, "likelihood": 4, "abrv": "PET-F" },
        { "title": "Spinal MRI Findings", "category": "Radiological", "urgency": 7, "likelihood": 5, "abrv": "SMRI-F" },
        { "title": "Doppler Ultrasound Findings", "category": "Radiological", "urgency": 6, "likelihood": 6, "abrv": "DOP-F" },
        { "title": "Neck CT Findings", "category": "Radiological", "urgency": 7, "likelihood": 5, "abrv": "NCT-F" },
        { "title": "Abdominal Ultrasound Findings", "category": "Radiological", "urgency": 6, "likelihood": 6, "abrv": "ABDU-F" },
        { "title": "Cardiac MRI Findings", "category": "Radiological", "urgency": 7, "likelihood": 5, "abrv": "C-MRI-F" },
        { "title": "Brain CT Findings", "category": "Radiological", "urgency": 8, "likelihood": 4, "abrv": "BCT-F" },
        { "title": "Lumbar X-Ray Findings", "category": "Radiological", "urgency": 6, "likelihood": 6, "abrv": "LX-F" },
        { "title": "Skull X-Ray Findings", "category": "Radiological", "urgency": 7, "likelihood": 5, "abrv": "SX-F" },
        { "title": "Chest CT Findings", "category": "Radiological", "urgency": 7, "likelihood": 5, "abrv": "CHCT-F" },
        { "title": "Pelvic Ultrasound Findings", "category": "Radiological", "urgency": 6, "likelihood": 6, "abrv": "P-UL-F" },
        { "title": "Thoracic MRI Findings", "category": "Radiological", "urgency": 7, "likelihood": 5, "abrv": "T-MRI-F" },
        { "title": "Whole Body Scan Findings", "category": "Radiological", "urgency": 8, "likelihood": 4, "abrv": "WB-F" },
        { "title": "Chest X-Ray Cardiomegaly", "category": "Radiological", "urgency": 8, "likelihood": 5, "abrv": "CXR-CM" },
        { "title": "Hepatic Steatosis on Ultrasound", "category": "Radiological", "urgency": 6, "likelihood": 5, "abrv": "HS-U" },
        { "title": "Right Lower Lobe Pneumonia on X-Ray", "category": "Radiological", "urgency": 7, "likelihood": 6, "abrv": "RLLP-X" },
        { "title": "Left Ventricular Hypertrophy on ECG", "category": "Cardiovascular", "urgency": 7, "likelihood": 5, "abrv": "LVH-ECG" },
        { "title": "Echocardiogram Reveals Mitral Valve Prolapse", "category": "Cardiovascular", "urgency": 7, "likelihood": 5, "abrv": "MVP-ECHO" },
        { "title": "Chest CT Shows Pulmonary Embolism", "category": "Radiological", "urgency": 9, "likelihood": 4, "abrv": "PE-CT" },
        { "title": "Brain MRI Shows Multiple Sclerosis Lesions", "category": "Neurological", "urgency": 8, "likelihood": 4, "abrv": "MS-MRI" },
        { "title": "Abdominal CT Reveals Acute Pancreatitis", "category": "Gastrointestinal", "urgency": 9, "likelihood": 5, "abrv": "AP-CT" },
        { "title": "Chest X-Ray Negative for Pneumonia", "category": "Radiological", "urgency": 4, "likelihood": 7, "abrv": "CXR-NP" },
        { "title": "Ultrasound Detects Kidney Stones", "category": "Nephrological", "urgency": 8, "likelihood": 6, "abrv": "KS-US" },
        { "title": "Echocardiogram Shows Left Atrial Enlargement", "category": "Cardiovascular", "urgency": 7, "likelihood": 5, "abrv": "LAE-ECHO" },
        { "title": "Bone Scan Indicates Metastasis", "category": "Oncological", "urgency": 9, "likelihood": 4, "abrv": "BS-MET" },
        { "title": "CT Scan Reveals Aortic Aneurysm", "category": "Cardiovascular", "urgency": 10, "likelihood": 3, "abrv": "AA-CT" },
        { "title": "MRI Shows Spinal Cord Compression", "category": "Neurological", "urgency": 10, "likelihood": 3, "abrv": "SCC-MRI" },
        { "title": "Ultrasound Shows Biliary Obstruction", "category": "Gastrointestinal", "urgency": 8, "likelihood": 4, "abrv": "BO-UL" },
        { "title": "Pelvic MRI Detects Ovarian Cysts", "category": "Gynecological", "urgency": 6, "likelihood": 5, "abrv": "OC-PMRI" },
        { "title": "Chest MRI Identifies Cardiac Mass", "category": "Cardiovascular", "urgency": 9, "likelihood": 4, "abrv": "CM-MRI" },
        { "title": "Spinal X-Ray Shows Herniated Disc", "category": "Musculoskeletal", "urgency": 7, "likelihood": 5, "abrv": "HD-SXR" },
        { "title": "Thyroid Ultrasound Reveals Nodule", "category": "Endocrine", "urgency": 6, "likelihood": 6, "abrv": "TN-US" },
        { "title": "Occipital Lobe Seizure Detected on EEG", "category": "Neurological", "urgency": 8, "likelihood": 4, "abrv": "OLS-EEG" },
        { "title": "Abdominal MRI Detects Liver Tumor", "category": "Oncological", "urgency": 9, "likelihood": 4, "abrv": "LT-MRI" },
        { "title": "Chest X-Ray Shows Enlarged Heart", "category": "Cardiovascular", "urgency": 7, "likelihood": 6, "abrv": "EH-CXR" },
        { "title": "Ultrasound Detects Gallbladder Inflammation", "category": "Gastrointestinal", "urgency": 8, "likelihood": 5, "abrv": "GI-US" },
        { "title": "Knee X-Ray Shows Osteoarthritis", "category": "Musculoskeletal", "urgency": 5, "likelihood": 7, "abrv": "OA-KXR" },
        { "title": "Axial Spondylitis Detected on MRI", "category": "Rheumatological", "urgency": 7, "likelihood": 4, "abrv": "AS-MRI" },
        { "title": "Brain CT Reveals Hemorrhage", "category": "Neurological", "urgency": 10, "likelihood": 4, "abrv": "BRH-CT" }
    ]
})