/**
 * Animates counting up to the target number
 * @param {Element} element - The element containing the number
 * @param {Number} target - The target number to count to
 * @param {Number} duration - Animation duration in milliseconds
 */
function animateNumber(element, target, duration = 2000) {
  const start = 0;
  const startTime = performance.now();

  function updateNumber(currentTime) {
    const elapsedTime = currentTime - startTime;
    const progress = Math.min(elapsedTime / duration, 1);
    const value = Math.floor(progress * (target - start) + start);

    element.textContent = value.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(updateNumber);
    }
  }

  requestAnimationFrame(updateNumber);
}

/**
   * Initializes the statistics block with animations when it becomes visible
   * @param {Element} block - The statistics block element
   */
export default function decorate(block) {
  // Add classes to the block
  block.classList.add('statistics-wrapper');

  // Get the first div as the heading (from merged cell)
  if (block.children.length > 0) {
    const headingDiv = block.children[0];
    if (headingDiv.textContent.trim()) {
      const heading = document.createElement('h2');
      heading.classList.add('statistics-heading');
      heading.textContent = headingDiv.textContent.trim();
      block.replaceChild(heading, headingDiv);
    }
  }

  // Create the grid container
  const gridContainer = document.createElement('div');
  gridContainer.classList.add('statistics-grid');

  // Analyze structure to determine if we have a Google Docs table format
  const rows = Array.from(block.children);

  // Check if we're working with a Google Docs table format
  if (rows.length >= 3) {
    // Row 2 should contain the numbers
    const numberRow = rows[1];
    // Row 3 should contain the labels
    const labelRow = rows[2];

    if (numberRow && labelRow) {
      const numberCells = Array.from(numberRow.children);
      const labelCells = Array.from(labelRow.children);

      // Process each column
      const columnCount = Math.min(numberCells.length, labelCells.length);
      for (let i = 0; i < columnCount; i += 1) {
        const statItem = document.createElement('div');
        statItem.classList.add('statistics-item');

        const number = document.createElement('div');
        number.classList.add('statistics-number');
        number.textContent = '0'; // Start at 0 for animation

        const label = document.createElement('div');
        label.classList.add('statistics-label');

        // Get the number value, removing any commas
        const numberText = numberCells[i].textContent.trim().replace(/,/g, '');
        const targetValue = parseInt(numberText, 10);

        // Make sure targetValue is a valid number
        if (!Number.isNaN(targetValue)) {
          number.dataset.target = targetValue;
        } else {
          number.dataset.target = 0;
        }

        // Get the label text
        label.textContent = labelCells[i].textContent.trim();

        statItem.appendChild(number);
        statItem.appendChild(label);
        gridContainer.appendChild(statItem);
      }

      // Remove the processed rows
      block.removeChild(numberRow);
      block.removeChild(labelRow);
    }
  }

  block.appendChild(gridContainer);

  // Set up intersection observer to trigger animations when visible
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Animate all numbers when visible
        const numbers = entry.target.querySelectorAll('.statistics-number');
        numbers.forEach((numElement) => {
          const target = parseInt(numElement.dataset.target, 10);
          animateNumber(numElement, target);
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  observer.observe(block);
}
