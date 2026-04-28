async (page) => {
  const links = [{"letter": "#", "title": "22q11-deletionssyndromet", "url": "https://vardpersonal.1177.se/globalassets/nkk/nationell/media/dokument/kunskapsstod/vardprogram/22q11-deletionssyndromet.pdf", "type": "V\u00e5rdprogram"}, {"letter": "A", "title": "ABCDE, initialt omh\u00e4ndertagande", "url": "https://vardpersonal.1177.se/kunskapsstod/kliniska-kunskapsstod/abcde-initialt-omhandertagande/", "type": "Kliniska kunskapsst\u00f6d"}, {"letter": "A", "title": "Adenoidhypertrofi hos barn", "url": "https://vardpersonal.1177.se/kunskapsstod/kliniska-kunskapsstod/adenoidhypertrofi/", "type": "Kliniska kunskapsst\u00f6d"}, {"letter": "A", "title": "Adhd", "url": "https://vardpersonal.1177.se/kunskapsstod/kliniska-kunskapsstod/adhd/", "type": "Kliniska kunskapsst\u00f6d"}, {"letter": "A", "title": "Akne", "url": "https://vardpersonal.1177.se/kunskapsstod/kliniska-kunskapsstod/akne/", "type": "Kliniska kunskapsst\u00f6d"}, {"letter": "A", "title": "Akromegali", "url": "https://vardpersonal.1177.se/kunskapsstod/kliniska-kunskapsstod/akromegali/", "type": "Kliniska kunskapsst\u00f6d"}, {"letter": "A", "title": "Akromioklavikularledsartros", "url": "https://vardpersonal.1177.se/kunskapsstod/kliniska-kunskapsstod/akromioklavikularledsartros/", "type": "Kliniska kunskapsst\u00f6d"}, {"letter": "A", "title": "Akromioklavikularledsskada", "url": "https://vardpersonal.1177.se/kunskapsstod/kliniska-kunskapsstod/akromioklavikularledsskada/", "type": "Kliniska kunskapsst\u00f6d"}, {"letter": "A", "title": "Aktinisk keratos", "url": "https://vardpersonal.1177.se/kunskapsstod/kliniska-kunskapsstod/aktinisk-keratos/", "type": "Kliniska kunskapsst\u00f6d"}, {"letter": "A", "title": "Akut hj\u00e4rtarytmi", "url": "https://vardpersonal.1177.se/kunskapsstod/kliniska-kunskapsstod/akut-hjartarytmi/", "type": "Kliniska kunskapsst\u00f6d"}, {"letter": "A", "title": "Akut leukemi", "url": "https://vardpersonal.1177.se/kunskapsstod/kliniska-kunskapsstod/akut-leukemi/", "type": "Kliniska kunskapsst\u00f6d"}, {"letter": "A", "title": "Akut tr\u00e5ngvinkelattack", "url": "https://vardpersonal.1177.se/kunskapsstod/kliniska-kunskapsstod/akut-trangvinkelattack/", "type": "Kliniska kunskapsst\u00f6d"}, {"letter": "A", "title": "Alarmsymtom vid misstanke om cancer hos barn och unga under 18 \u00e5r", "url": "https://vardpersonal.1177.se/kunskapsstod/kliniska-kunskapsstod/alarmsymtom-vid-misstanke-om-cancer-hos-barn-och-unga-under-18-ar/", "type": "Kliniska kunskapsst\u00f6d"}, {"letter": "A", "title": "Allergi vid bi- eller getingstick", "url": "https://vardpersonal.1177.se/kunskapsstod/kliniska-kunskapsstod/allergi-vid-bi--eller-getingstick/", "type": "Kliniska kunskapsst\u00f6d"}, {"letter": "A", "title": "Allergisk rinokonjunktivit", "url": "https://vardpersonal.1177.se/kunskapsstod/kliniska-kunskapsstod/allergisk-rinokonjunktivit/", "type": "Kliniska kunskapsst\u00f6d"}, {"letter": "A", "title": "Allvarliga ospecifika symtom som kan bero p\u00e5 cancer", "url": "https://vardpersonal.1177.se/kunskapsstod/kliniska-kunskapsstod/allvarliga-ospecifika-symtom-som-kan-bero-pa-cancer/", "type": "Kliniska kunskapsst\u00f6d"}, {"letter": "A", "title": "Amenorr\u00e9", "url": "https://vardpersonal.1177.se/kunskapsstod/kliniska-kunskapsstod/amenorre/", "type": "Kliniska kunskapsst\u00f6d"}, {"letter": "A", "title": "Anafylaxi", "url": "https://vardpersonal.1177.se/kunskapsstod/kliniska-kunskapsstod/anafylaxi/", "type": "Kliniska kunskapsst\u00f6d"}, {"letter": "A", "title": "Analabscess", "url": "https://vardpersonal.1177.se/kunskapsstod/kliniska-kunskapsstod/analabscess/", "type": "Kliniska kunskapsst\u00f6d"}, {"letter": "A", "title": "Analcancer", "url": "https://vardpersonal.1177.se/kunskapsstod/kliniska-kunskapsstod/analcancer/", "type": "Kliniska kunskapsst\u00f6d"}];
  const results = {};
  const errors = [];
  
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    console.log(`Scraping [${i+1}/${links.length}] ${link.title.substring(0, 30)}`);
    
    try {
      await page.goto(link.url, { waitUntil: 'networkidle', timeout: 30000 });
      
      const data = await page.evaluate(() => {
        const main = document.querySelector('main');
        if (!main) return null;
        
        return {
          title: document.title,
          url: window.location.href,
          text_content: main.innerText.substring(0, 2000),
          headings: Array.from(main.querySelectorAll('h2, h3, h4')).map(h => ({
            level: h.tagName.toLowerCase(),
            text: h.textContent.trim()
          }))
        };
      });
      
      if (data) {
        results[link.url] = {
          ...link,
          scraped_at: new Date().toISOString(),
          content: data
        };
        console.log('✓ Success');
      } else {
        errors.push({ url: link.url, error: 'No main element' });
        console.log('⚠ No content');
      }
    } catch (e) {
      errors.push({ url: link.url, error: e.message });
      console.log(`✗ Error: ${e.message.substring(0, 30)}`);
    }
    
    // Delay between requests
    await new Promise(r => setTimeout(r, 1000));
  }
  
  return { results, errors, count: Object.keys(results).length };
}
