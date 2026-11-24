interface CitationData {
  title: string;
  author: string;
  siteName: string;
  url: string;
  date: string; // ISO date string
}

export function generateCitations(data: CitationData) {
  const { title, author, siteName, url, date } = data;
  
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.toLocaleString('en-US', { month: 'long' });
  const day = d.getDate();
  
  const accessedDate = new Date();
  const accessedDay = accessedDate.getDate();
  const accessedMonth = accessedDate.toLocaleString('en-US', { month: 'long' });
  const accessedYear = accessedDate.getFullYear();

  const apa = `${author}. (${year}, ${month} ${day}). ${title}. ${siteName}. ${url}`;
  
  const mla = `${author}. "${title}." ${siteName}, ${month} ${day}, ${year}, ${url}. Accessed ${day} ${month} ${year}.`;
  
  const chicago = `${author}. "${title}." ${siteName}. Accessed ${accessedMonth} ${accessedDay}, ${accessedYear}. ${url}.`;
  
  const bibtex = `@misc{bandwar-${title.toLowerCase().replace(/[^a-z0-9]/g, '')},
  author = {${author}},
  title = {${title}},
  year = {${year}},
  month = {${month}},
  publisher = {${siteName}},
  url = {${url}},
  note = {Accessed: ${accessedDay} ${accessedMonth} ${accessedYear}}
}`;

  return { apa, mla, chicago, bibtex };
}