const form = document.getElementById('campaign-form');
const result = document.getElementById('result');

const objectiveStrategies = {
  'Brand Awareness': 'maximize reach with high-frequency top-of-funnel creatives and short-form video',
  'Lead Generation': 'drive qualified sign-ups with clear forms, lead magnets, and retargeting sequences',
  'Sales Conversion': 'optimize for purchases using offer-driven creatives, urgency, and cart recovery audiences',
  'App Installs': 'increase installs with benefit-focused demos, social proof, and app-store optimized CTAs',
};

const toneExamples = {
  Professional: ['Trusted by growing teams', 'Built for consistent performance'],
  Bold: ['Stop scrolling. Start winning.', 'The upgrade your routine deserves'],
  Friendly: ['Made to make your day easier', 'Simple, smart, and ready for you'],
  Luxury: ['Crafted for refined expectations', 'Premium quality, unmistakably yours'],
};

const formatMoney = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

const distributeBudget = (budget, channels) => {
  const splits = channels.map((name, index) => {
    const ratio = index === 0 ? 0.4 : index === 1 ? 0.3 : 0.3 / Math.max(channels.length - 2, 1);
    return { name, amount: Math.round(budget * ratio) };
  });

  const total = splits.reduce((sum, item) => sum + item.amount, 0);
  if (splits.length > 0 && total !== budget) {
    splits[0].amount += budget - total;
  }

  return splits;
};

const createAdCopies = (product, audience, tone) => {
  const hooks = toneExamples[tone] || toneExamples.Professional;

  return hooks.map((hook, index) => ({
    headline: `${product}: ${hook}`,
    body: `Designed for ${audience}. See why customers choose ${product} to get better results with less hassle.`,
    cta: index % 2 === 0 ? 'Get Started Today' : 'Learn More',
  }));
};

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const product = document.getElementById('product').value.trim();
  const objective = document.getElementById('objective').value;
  const audience = document.getElementById('audience').value.trim();
  const budget = Number(document.getElementById('budget').value);
  const tone = document.getElementById('tone').value;

  const channels = Array.from(document.querySelectorAll('input[name="channel"]:checked')).map(
    (checkbox) => checkbox.value,
  );

  if (!channels.length) {
    result.innerHTML = '<h2>Generated Campaign</h2><p class="hint">Please choose at least one channel.</p>';
    return;
  }

  const strategy = objectiveStrategies[objective] || 'balance awareness and conversion with iterative testing';
  const budgetPlan = distributeBudget(budget, channels);
  const copies = createAdCopies(product, audience, tone);

  result.innerHTML = `
    <h2>Generated Campaign</h2>

    <section class="output-section">
      <h3>Campaign Strategy</h3>
      <ul>
        <li><strong>Objective:</strong> ${objective}</li>
        <li><strong>Audience:</strong> ${audience}</li>
        <li><strong>Approach:</strong> ${strategy}</li>
        <li><strong>Brand Voice:</strong> ${tone}</li>
      </ul>
    </section>

    <section class="output-section">
      <h3>Budget Allocation (${formatMoney(budget)}/month)</h3>
      <ul>
        ${budgetPlan.map((item) => `<li>${item.name}: <strong>${formatMoney(item.amount)}</strong></li>`).join('')}
      </ul>
    </section>

    <section class="output-section">
      <h3>AI-Generated Ad Copy Variants</h3>
      ${copies
        .map(
          (copy) => `
            <article class="ad-copy">
              <p><strong>Headline:</strong> ${copy.headline}</p>
              <p><strong>Body:</strong> ${copy.body}</p>
              <p><strong>CTA:</strong> ${copy.cta}</p>
            </article>
          `,
        )
        .join('')}
    </section>

    <section class="output-section">
      <h3>7-Day Launch Plan</h3>
      <ol>
        <li>Day 1: Launch two creative sets per channel with conversion tracking enabled.</li>
        <li>Day 2-3: Review click-through rate and pause bottom 20% performers.</li>
        <li>Day 4: Duplicate top ad set and test one new hook + CTA variation.</li>
        <li>Day 5-6: Shift 15% budget toward best channel and retarget engaged users.</li>
        <li>Day 7: Export insights and finalize next-week optimization brief.</li>
      </ol>
    </section>
  `;
});
