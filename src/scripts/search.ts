// Search highlighter
export default function searchBears(): void {
  const searchForm = document.querySelector<HTMLFormElement>('.search');
  if (searchForm === null) return;

  searchForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const article = document.querySelector<HTMLElement>('article');
    if (article === null) return;

    article.querySelectorAll('.highlight').forEach((el) => {
      const parent = el.parentNode;
      if (parent === null) return;
      parent.replaceChild(document.createTextNode(el.textContent ?? ''), el);
      parent.normalize();
    });

    const queryField = this.elements.namedItem('q') as HTMLInputElement | null;
    const searchKey = queryField?.value.trim();
    if (searchKey === null || searchKey === undefined) return;

    const regex = new RegExp(
      '(' + searchKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')',
      'gi'
    );

    const walk = (node: ChildNode): void => {
      if (node.nodeType === 3) {
        // Text node
        const match = node.nodeValue?.match(regex);
        if (match !== null && match !== undefined) {
          const span = document.createElement('span');
          span.innerHTML = (node.nodeValue ?? '').replace(
            regex,
            '<mark class="highlight">$1</mark>'
          );
          node.replaceWith(...Array.from(span.childNodes));
        }
      } else if (
        node.nodeType === 1 &&
        (node as Element).tagName !== 'SCRIPT' &&
        (node as Element).tagName !== 'STYLE' &&
        (node as Element).tagName !== 'FORM'
      ) {
        node.childNodes.forEach(walk);
      }
    };

    walk(article);
  });
}
