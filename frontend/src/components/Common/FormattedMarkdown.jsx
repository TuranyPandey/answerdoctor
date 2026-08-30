import React from 'react';

/**
 * A lightweight, high-performance Markdown & Math formatter
 * renders headers, bold/italic text, bullet points, callouts, and inline code with zero extra dependencies.
 */
export default function FormattedMarkdown({ content, className = '' }) {
  if (!content) return null;

  // Split into paragraphs / lines
  const lines = content.split('\n');
  const elements = [];
  let inList = false;
  let listItems = [];

  const flushList = (key) => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${key}`} className="formatted-list" style={{
          listStyleType: 'none',
          paddingLeft: 0,
          margin: '12px 0',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  const formatInline = (text) => {
    if (!text) return '';
    
    // Split by inline code `code` first
    const parts = text.split(/(`[^`]+`)/g);
    
    return parts.map((part, idx) => {
      if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
        const codeContent = part.slice(1, -1);
        return (
          <code key={idx} style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(51, 65, 85, 0.8)',
            color: '#38bdf8',
            fontFamily: "'DM Mono', monospace",
            padding: '2px 7px',
            borderRadius: '4px',
            fontSize: '12.5px',
            fontWeight: 500
          }}>
            {codeContent}
          </code>
        );
      }

      // Format **bold** and *italic*
      const subParts = part.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
      return subParts.map((sub, sIdx) => {
        if (sub.startsWith('**') && sub.endsWith('**') && sub.length > 4) {
          return (
            <strong key={`${idx}-${sIdx}`} style={{
              color: '#38bdf8',
              fontWeight: 600,
            }}>
              {sub.slice(2, -2)}
            </strong>
          );
        }
        if (sub.startsWith('*') && sub.endsWith('*') && sub.length > 2) {
          return (
            <em key={`${idx}-${sIdx}`} style={{ color: '#cbd5e1' }}>
              {sub.slice(1, -1)}
            </em>
          );
        }
        return sub;
      });
    });
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList(index);
      return;
    }

    // Headers (###, ##, #)
    if (trimmed.startsWith('#')) {
      flushList(index);
      const level = trimmed.match(/^#+/)[0].length;
      const titleText = trimmed.replace(/^#+\s*/, '');

      if (level === 1 || level === 2) {
        elements.push(
          <h3 key={index} style={{
            fontSize: '16px',
            fontWeight: 700,
            color: '#f8fafc',
            marginTop: index === 0 ? '0' : '18px',
            marginBottom: '10px',
            paddingBottom: '6px',
            borderBottom: '1px solid rgba(51, 65, 85, 0.6)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {formatInline(titleText)}
          </h3>
        );
      } else {
        elements.push(
          <h4 key={index} style={{
            fontSize: '14.5px',
            fontWeight: 600,
            color: '#cbd5e1',
            marginTop: index === 0 ? '0' : '14px',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            {formatInline(titleText)}
          </h4>
        );
      }
      return;
    }

    // Bullet points (- or *)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      inList = true;
      const bulletContent = trimmed.replace(/^[-*]\s*/, '');
      listItems.push(
        <li key={`item-${index}`} style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
          background: 'rgba(30, 41, 59, 0.4)',
          border: '1px solid rgba(51, 65, 85, 0.4)',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '13.5px',
          lineHeight: 1.5,
          color: '#e2e8f0'
        }}>
          <span style={{ color: '#38bdf8', fontSize: '14px', flexShrink: 0, marginTop: '1px' }}>👉</span>
          <div style={{ flex: 1 }}>{formatInline(bulletContent)}</div>
        </li>
      );
      return;
    }

    // Numbered lists (1., 2.)
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      inList = true;
      const num = numMatch[1];
      const numContent = numMatch[2];
      listItems.push(
        <li key={`numitem-${index}`} style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
          background: 'rgba(30, 41, 59, 0.4)',
          border: '1px solid rgba(51, 65, 85, 0.4)',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '13.5px',
          lineHeight: 1.5,
          color: '#e2e8f0'
        }}>
          <span style={{
            background: '#0284c7',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '11px',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: '2px'
          }}>
            {num}
          </span>
          <div style={{ flex: 1 }}>{formatInline(numContent)}</div>
        </li>
      );
      return;
    }

    // Callout / Blockquote (> text)
    if (trimmed.startsWith('>')) {
      flushList(index);
      const quoteText = trimmed.replace(/^>\s*/, '');
      elements.push(
        <div key={index} style={{
          background: 'rgba(56, 189, 248, 0.08)',
          borderLeft: '4px solid #38bdf8',
          padding: '10px 14px',
          borderRadius: '0 6px 6px 0',
          margin: '12px 0',
          fontSize: '13.5px',
          color: '#e2e8f0'
        }}>
          {formatInline(quoteText)}
        </div>
      );
      return;
    }

    // Normal Paragraph
    flushList(index);
    elements.push(
      <p key={index} style={{
        margin: '8px 0',
        fontSize: '13.5px',
        lineHeight: 1.6,
        color: '#e2e8f0'
      }}>
        {formatInline(trimmed)}
      </p>
    );
  });

  flushList(lines.length);

  return <div className={`formatted-markdown ${className}`}>{elements}</div>;
}
