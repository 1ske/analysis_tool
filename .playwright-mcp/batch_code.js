async (page) => {
  const links = [{"letter": "A", "title": "ABCDE, initialt omhändertagande", "url": "https://vardpersonal.1177.se/kunskapsstod/kliniska-kunskapsstod/abcde-initialt-omhandertagande/", "type": "Kliniska kunskapsstöd"}, {"letter": "A", "title": "Adenoidhypertrofi hos barn", "url": "https://vardpersonal.1177.se/kunskapsstod/kliniska-kunskapsstod/adenoidhypertrofi/", "type": "Kliniska kunskapsstöd"}, {"letter": "A", "title": "Adhd", "url": "https://vardpersonal.1177.se/kunskapsstod/kliniska-kunskapsstod/adhd/", "type": "Kliniska kunskapsstöd"}, {"letter": "A", "title": "Akne", "url": "https://vardpersonal.1177.se/kunskapsstod/kliniska-kunskapsstod/akne/", "type": "Kliniska kunskapsstöd"}, {"letter": "A", "title": "Akromegali", "url": "https://vardpersonal.1177.se/kunskapsstod/kliniska-kunskapsstod/akromegali/", "type": "Kliniska kunskapsstöd"}, {"letter": "A", "title": "Akromioklavikularledsartros", "url": "https://vardpersonal.1177.se/kunskapsstod/kliniska-kunskapsstod/akromioklavikularledsartros/", "type": "Kliniska kunskapsstöd"}, {"letter": "A", "title": "Akromioklavikularledsskada", "url": "https://vardpersonal.1177.se/kunskapsstod/kliniska-kunskapsstod/akromioklavikularledsskada/", "type": "Kliniska kunskapsstöd"}, {"letter": "A", "title": "Aktinisk keratos", "url": "https://vardpersonal.1177.se/kunskapsstod/kliniska-kunskapsstod/aktinisk-keratos/", "type": "Kliniska kunskapsstöd"}, {"letter": "A", "title": "Akut hjärtarytmi", "url": "https://vardpersonal.1177.se/kunskapsstod/kliniska-kunskapsstod/akut-hjartarytmi/", "type": "Kliniska kunskapsstöd"}, {"letter": "A", "title": "Akut leukemi", "url": "https://vardpersonal.1177.se/kunskapsstod/kliniska-kunskapsstod/akut-leukemi/", "type": "Kliniska kunskapsstöd"}];
  const results = {};
  const errors = [];
  
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    try {
      await page.goto(link.url, { waitUntil: 'networkidle', timeout: 30000 });
      
      const data = await page.evaluate(() => {
        const main = document.querySelector('main');
        if (!main) return null;
        
        return {
          title: document.title,
          url: window.location.href,
          text_content: main.innerText.substring(0, 5000),
          headings: Array.from(main.querySelectorAll('h2, h3, h4')).map(h => ({
            level: h.tagName.toLowerCase(),
            text: h.textContent.trim()
          }))
        };
      });
      
      if (data) {
        results[link.url] = {
          letter: link.letter,
          title: link.title,
          type: link.type,
          url: link.url,
          scraped_at: new Date().toISOString(),
          content: data
        };
      } else {
        errors.push({ url: link.url, error: 'No main element' });
      }
    } catch (e) {
      errors.push({ url: link.url, error: e.message });
    }
  }
  
  return { 
    pages_scraped: Object.keys(results).length,
    errors: errors.length,
    results: results
  };
}