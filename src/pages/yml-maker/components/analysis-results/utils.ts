
export const extractCodeBlock = (content: string, language: string): string => {
  const codeBlockRegex = new RegExp(`\`\`\`${language}[\\s\\S]*?([\\s\\S]*?)\`\`\``, 'g');
  const matches = content.match(codeBlockRegex);
  
  if (matches && matches.length > 0) {
    return matches[0]
      .replace(`\`\`\`${language}`, '')
      .replace(/```/g, '')
      .trim();
  }
  return content.trim();
};

export const cleanContent = (section: string): string => {
  return section
    .replace(/^.*?:/, '')
    .trim();
};

export const renderResultContent = (raw_response: any) => {
  if (!raw_response) return [];

  if (typeof raw_response === 'string') {
    const sections = raw_response.split('\n---\n').map(section => section.trim());
    
    return sections.map(section => {
      if (section.includes('Required Imports:')) {
        const content = cleanContent(section);
        return {
          title: 'Required Imports',
          content: extractCodeBlock(content, 'python'),
          language: 'python'
        };
      } 
      else if (section.includes('YML Configuration:')) {
        const content = cleanContent(section);
        return {
          title: 'YML Configuration',
          content: extractCodeBlock(content, 'yaml'),
          language: 'yaml'
        };
      }
      else if (section.includes('Processed Code:')) {
        const content = cleanContent(section);
        return {
          title: 'Processed Code',
          content: extractCodeBlock(content, 'python'),
          language: 'python'
        };
      }
      return {
        title: 'Analysis',
        content: section,
        language: 'text'
      };
    }).filter(section => section.content.length > 0);
  }

  return [{
    title: 'Raw Response',
    content: JSON.stringify(raw_response, null, 2),
    language: 'json'
  }];
};
