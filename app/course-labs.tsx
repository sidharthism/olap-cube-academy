'use client';

import { useEffect, useRef, useState } from 'react';
import {
  factRows,
  learningResources,
  loadMetadata,
  money,
  rawCustomers,
  rawLines,
  rawOrders,
  rawProducts,
  rawStores,
} from './course-data';

export type DecisionBriefDraft = {
  claim: string;
  query: string;
  evidence: string;
  caveat: string;
  action: string;
};

type ChapterLabProps = {
  chapter: number;
  onComplete: () => void;
  completed: boolean;
  savedBrief?: DecisionBriefDraft | null;
  onBriefSave?: (brief: DecisionBriefDraft) => void;
  savedNextMission?: string;
  onNextMissionSave?: (mission: string) => void;
};

function FinishButton({
  ready,
  completed,
  onComplete,
  readyText = 'Save this activity',
}: {
  ready: boolean;
  completed: boolean;
  onComplete: () => void;
  readyText?: string;
}) {
  return (
    <div className={`lab-finish ${ready || completed ? 'ready' : ''}`} aria-live="polite">
      <p>
        {completed
          ? '✓ Completion recorded. Lab experiments reset when you leave this chapter.'
          : ready
            ? 'All required steps are complete. Save this activity.'
            : 'Complete every required step to unlock this activity.'}
      </p>
      <button
        type="button"
        className="primary-button"
        disabled={!ready || completed}
        onClick={onComplete}
      >
        {completed ? 'Activity complete' : readyText}
      </button>
    </div>
  );
}

export function ChapterLab(props: ChapterLabProps) {
  switch (props.chapter) {
    case 1: return <QuestionSorter {...props} />;
    case 2: return <RawExplorer {...props} />;
    case 3: return <GrainSimulator {...props} />;
    case 4: return <StarBuilder {...props} />;
    case 5: return <HierarchyLadder {...props} />;
    case 6: return <MeasureGates {...props} />;
    case 7: return <CubeExplorer {...props} />;
    case 8: return <SqlBuilder {...props} />;
    case 9: return <FilterLab {...props} />;
    case 10: return <HierarchyElevator {...props} />;
    case 11: return <PivotDrillthrough {...props} />;
    case 12: return <GroupingSetGenerator {...props} />;
    case 13: return <ErrorClinic {...props} />;
    case 14: return <EngineSimulator {...props} />;
    case 15: return <QualityControlRoom {...props} />;
    case 16: return <DecisionBriefBuilder {...props} />;
    case 17: return <KnowledgeMap {...props} />;
    default: return null;
  }
}

function QuestionSorter({ onComplete, completed }: ChapterLabProps) {
  const questions = [
    ['Save order 1004', 'OLTP'],
    ['Change Asha’s delivery address', 'OLTP'],
    ['Compare sales by region and quarter', 'OLAP'],
    ['Find the strongest category this year', 'OLAP'],
    ['Record a card payment result', 'OLTP'],
    ['Explain why February beat January', 'OLAP'],
  ] as const;
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const allAnswered = questions.every((_, index) => answers[index]);
  const score = questions.filter(([, answer], index) => answers[index] === answer).length;
  const ready = allAnswered && score === questions.length;

  return (
    <div className="lab-stack">
      <div className="sort-grid">
        {questions.map(([question, answer], index) => (
          <article className="sort-card" key={question}>
            <p>{question}</p>
            <div className="segmented-control" role="group" aria-label={`Classify: ${question}`}>
              {['OLTP', 'OLAP'].map((choice) => (
                <button
                  type="button"
                  key={choice}
                  aria-pressed={answers[index] === choice}
                  onClick={() => setAnswers((current) => ({ ...current, [index]: choice }))}
                >
                  {choice}
                </button>
              ))}
            </div>
            {answers[index] && (
              <small className={answers[index] === answer ? 'good-text' : 'warn-text'} role="status" aria-live="polite">
                {answers[index] === answer
                  ? `Correct: ${answer} is the right system.`
                  : `Think about whether this records one event or analyses many.`}
              </small>
            )}
          </article>
        ))}
      </div>
      <div className="result-strip">
        <span>Answered correctly</span><strong>{score} / {questions.length}</strong>
      </div>
      <FinishButton ready={ready} completed={completed} onComplete={onComplete} />
    </div>
  );
}

function RawExplorer({ onComplete, completed }: ChapterLabProps) {
  const [orderId, setOrderId] = useState(1002);
  const [traced, setTraced] = useState(false);
  const [tracedOrders, setTracedOrders] = useState<number[]>([]);
  const [inspectedCancelled, setInspectedCancelled] = useState(false);
  const order = rawOrders.find((item) => item.orderId === orderId)!;
  const lines = rawLines.filter((line) => line.orderId === orderId);
  const customer = rawCustomers.find((item) => item.customerId === order.customerId)!;
  const store = rawStores.find((item) => item.storeId === order.storeId)!;
  const total = lines.reduce((sum, line) => sum + line.quantity * line.unitPrice - line.discount, 0);

  return (
    <div className="lab-stack">
      <div className="control-row">
        <label htmlFor="raw-order">Choose a raw order</label>
        <select id="raw-order" value={orderId} onChange={(event) => {
          const nextOrder = Number(event.target.value);
          setOrderId(nextOrder);
          setTraced(false);
          if (nextOrder === 1006) setInspectedCancelled(true);
        }}>
          {rawOrders.map((item) => (
            <option value={item.orderId} key={item.orderId}>
              Order {item.orderId} · {item.status}
            </option>
          ))}
        </select>
      </div>

      <div className="key-trail" aria-label="Linked raw records">
        <div className="raw-card"><span>customer_id</span><strong>{customer.customerId}</strong><small>{customer.customerName}</small></div>
        <b aria-hidden="true">→</b>
        <div className="raw-card"><span>order_id</span><strong>{order.orderId}</strong><small>{order.orderDate}</small></div>
        <b aria-hidden="true">→</b>
        <div className="raw-card"><span>store_id</span><strong>{store.storeId}</strong><small>{store.storeName} · {store.region}</small></div>
      </div>

      {order.status === 'cancelled' && (
        <div className="warning-callout">Cancelled event: this row stays in the raw system but must not enter fact_sales.</div>
      )}

      <div className="table-scroll">
        <table className="data-table">
          <caption>raw_order_lines joined to raw_products for order {orderId}</caption>
          <thead><tr><th>order_id</th><th>line_no</th><th>product_id</th><th>Joined name</th><th>Qty</th><th>Price</th><th>Discount</th><th>Net</th></tr></thead>
          <tbody>
            {lines.map((line) => {
              const product = rawProducts.find((item) => item.productId === line.productId)!;
              return (
                <tr key={line.lineNo}>
                  <td>{line.orderId}</td><td>{line.lineNo}</td><td>{line.productId}</td><td>{product.productName}</td>
                  <td>{line.quantity}</td><td>{money(line.unitPrice)}</td><td>{money(line.discount)}</td>
                  <td>{money(line.quantity * line.unitPrice - line.discount)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot><tr><th colSpan={7}>Order-line total</th><td>{money(total)}</td></tr></tfoot>
        </table>
      </div>

      <button type="button" className="sketch-button" onClick={() => {
        setTraced(true);
        setTracedOrders((current) => current.includes(orderId) ? current : [...current, orderId]);
      }}>
        Trace these foreign keys
      </button>
      {traced && <p className="mentor-feedback">The IDs are stored in the raw rows. Human-readable names appeared only after the joins.</p>}
      <div className="task-checks" role="status" aria-live="polite">
        <span className={tracedOrders.includes(1002) ? 'done' : ''}>Trace order 1002 {tracedOrders.includes(1002) ? '✓' : '○'}</span>
        <span className={inspectedCancelled ? 'done' : ''}>Inspect cancelled order 1006 {inspectedCancelled ? '✓' : '○'}</span>
      </div>
      <FinishButton ready={tracedOrders.includes(1002) && inspectedCancelled} completed={completed} onComplete={onComplete} readyText="Save the raw-table evidence" />
    </div>
  );
}

function GrainSimulator({ onComplete, completed }: ChapterLabProps) {
  const choices = [
    { id: 'order', label: 'One row per completed order', rows: 5, detail: 'Good for completed-order totals, but product lines disappear.' },
    { id: 'line', label: 'One row per completed order line', rows: 10, detail: 'Keeps products, quantities, discounts, and safe line-level sums.' },
    { id: 'product-day', label: 'One row per product per day', rows: 10, detail: 'This tiny fixture still has 10 groups; repeated same-product sales on one day would merge and lose order detail.' },
  ];
  const [grain, setGrain] = useState('order');
  const [duplicationChecked, setDuplicationChecked] = useState(false);
  const selected = choices.find((choice) => choice.id === grain)!;
  const uniqueKeys = new Set(factRows.map((fact) => `${fact.order}|${fact.line}`)).size;
  const duplicationPass = uniqueKeys === factRows.length && factRows.length === 10;
  return (
    <div className="lab-stack">
      <div className="choice-board">
        {choices.map((choice) => (
          <button type="button" key={choice.id} aria-pressed={grain === choice.id} onClick={() => setGrain(choice.id)}>
            <span className="hand-copy">{choice.label}</span><small>{choice.detail}</small>
          </button>
        ))}
      </div>
      <div className="grain-preview">
        <div><span>Fact rows</span><strong>{selected.rows}</strong></div>
        <div><span>COUNT(*) means</span><strong>{grain === 'line' ? 'order lines' : grain === 'order' ? 'orders' : 'product-days'}</strong></div>
        <div><span>Product drill-through</span><strong>{grain === 'line' ? 'Yes' : 'Limited'}</strong></div>
      </div>
      <div className={grain === 'line' ? 'success-callout' : 'warning-callout'}>
        {grain === 'line'
          ? 'Correct grain: exactly one completed order line. UNIQUE(order_id, line_no) protects it.'
          : 'This row meaning cannot answer every requested product-level question.'}
      </div>
      <button type="button" className="sketch-button" disabled={grain !== 'line'} onClick={() => setDuplicationChecked(true)}>Run UNIQUE(order_id, line_no) check</button>
      {duplicationChecked && <div className={duplicationPass ? 'success-callout' : 'warning-callout'} role="status" aria-live="polite">{duplicationPass ? `PASS: ${uniqueKeys} unique keys for ${factRows.length} fact rows. No duplicate grain.` : 'FAIL: a fact key is duplicated.'}</div>}
      <FinishButton ready={grain === 'line' && duplicationChecked && duplicationPass} completed={completed} onComplete={onComplete} />
    </div>
  );
}

function StarBuilder({ onComplete, completed }: ChapterLabProps) {
  const fields = [
    ['net_amount', 'fact_sales'], ['quantity', 'fact_sales'], ['order_id', 'fact_sales'],
    ['month_name', 'dim_date'], ['category', 'dim_product'], ['product_name', 'dim_product'],
    ['region', 'dim_store'], ['customer_name', 'dim_customer'],
  ] as const;
  const zones = ['fact_sales', 'dim_date', 'dim_product', 'dim_store', 'dim_customer'];
  const keyLinks = [
    ['date_key', 'dim_date'], ['product_key', 'dim_product'],
    ['store_key', 'dim_store'], ['customer_key', 'dim_customer'],
  ] as const;
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [connections, setConnections] = useState<Record<string, string>>({});
  const correct = fields.filter(([field, zone]) => placements[field] === zone).length;
  const connected = keyLinks.filter(([key, dimension]) => connections[key] === dimension).length;
  return (
    <div className="lab-stack">
      <div className="star-diagram" aria-label="Star schema layout">
        <span className="dimension-node top-node">dim_date</span>
        <span className="dimension-node left-node">dim_product</span>
        <strong className="fact-node">fact_sales</strong>
        <span className="dimension-node right-node">dim_store</span>
        <span className="dimension-node bottom-node">dim_customer</span>
      </div>
      <div className="field-classifier">
        {fields.map(([field, answer]) => (
          <div key={field} className="field-row">
            <code>{field}</code>
            <select
              aria-label={`Place ${field}`}
              value={placements[field] ?? ''}
              onChange={(event) => setPlacements((current) => ({ ...current, [field]: event.target.value }))}
            >
              <option value="">Choose a table…</option>
              {zones.map((zone) => <option key={zone}>{zone}</option>)}
            </select>
            <span className={placements[field] === answer ? 'good-text' : ''} aria-hidden="true">{placements[field] === answer ? '✓' : ''}</span>
          </div>
        ))}
      </div>
      <fieldset className="key-connection-board"><legend className="hand-heading">Connect each fact key to its dimension</legend>{keyLinks.map(([key, answer]) => <label key={key}><code>fact_sales.{key}</code><span aria-hidden="true">→</span><select aria-label={`Connect ${key}`} value={connections[key] ?? ''} onChange={(event) => setConnections((current) => ({ ...current, [key]: event.target.value }))}><option value="">Choose dimension…</option>{zones.filter((zone) => zone !== 'fact_sales').map((zone) => <option key={zone}>{zone}</option>)}</select><b className={connections[key] === answer ? 'good-text' : ''} aria-hidden="true">{connections[key] === answer ? '✓' : ''}</b></label>)}</fieldset>
      <div className="result-strip" role="status" aria-live="polite"><span>Fields placed {correct} / {fields.length} · keys connected {connected} / {keyLinks.length}</span><strong>{correct === fields.length && connected === keyLinks.length ? 'Star complete ✓' : 'Keep building'}</strong></div>
      <FinishButton ready={correct === fields.length && connected === keyLinks.length} completed={completed} onComplete={onComplete} />
    </div>
  );
}

function HierarchyLadder({ onComplete, completed }: ChapterLabProps) {
  const [timePath, setTimePath] = useState('');
  const [storePath, setStorePath] = useState('');
  const correct = timePath === 'day-month-quarter-year' && storePath === 'store-region-all';
  return (
    <div className="lab-stack">
      <div className="ladder-grid">
        <fieldset className="ladder-card">
          <legend className="hand-heading">Time ladder</legend>
          {[
            ['month-day-year-quarter', 'Month → Day → Year → Quarter'],
            ['day-month-quarter-year', 'Day → Month → Quarter → Year → All'],
            ['day-quarter-month-year', 'Day → Quarter → Month → Year'],
          ].map(([id, label]) => <label key={id}><input type="radio" name="time" value={id} checked={timePath === id} onChange={() => setTimePath(id)} /> {label}</label>)}
        </fieldset>
        <fieldset className="ladder-card">
          <legend className="hand-heading">Store ladder</legend>
          {[
            ['region-store-all', 'Region → Store → All'],
            ['store-region-all', 'Store → Region → All'],
            ['store-all-region', 'Store → All → Region'],
          ].map(([id, label]) => <label key={id}><input type="radio" name="store" value={id} checked={storePath === id} onChange={() => setStorePath(id)} /> {label}</label>)}
        </fieldset>
      </div>
      <div className={correct ? 'success-callout' : 'mentor-feedback'}>
        {correct ? 'Both paths move from detailed members toward the All member.' : 'A valid hierarchy follows real parent-child relationships from detail to summary.'}
      </div>
      <FinishButton ready={correct} completed={completed} onComplete={onComplete} />
    </div>
  );
}

function MeasureGates({ onComplete, completed }: ChapterLabProps) {
  const measures = [
    ['net_sales', 'sum'], ['quantity', 'sum'], ['discount_amount', 'sum'],
    ['average_price', 'recalculate'], ['discount_rate', 'recalculate'],
    ['inventory_balance', 'time'], ['unit_price', 'recalculate'],
  ] as const;
  const labels: Record<string, string> = { sum: 'Safe to sum', recalculate: 'Recalculate from parts', time: 'Do not sum across time' };
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const score = measures.filter(([measure, answer]) => answers[measure] === answer).length;
  return (
    <div className="lab-stack">
      <div className="measure-board">
        {measures.map(([measure, answer]) => (
          <div className="measure-row" key={measure}>
            <code>{measure}</code>
            <div className="mini-options" role="group" aria-label={`Classify ${measure}`}>
              {Object.entries(labels).map(([id, label]) => (
                <button key={id} type="button" aria-pressed={answers[measure] === id} onClick={() => setAnswers((current) => ({ ...current, [measure]: id }))}>{label}</button>
              ))}
            </div>
            {answers[measure] && <small className={answers[measure] === answer ? 'good-text' : 'warn-text'} role="status" aria-live="polite">{answers[measure] === answer ? '✓ Correct' : 'Try again'}</small>}
          </div>
        ))}
      </div>
      <div className="formula-strip"><code>net_sales = quantity × unit_price − discount_amount</code><strong>{money(19800)}</strong></div>
      <FinishButton ready={score === measures.length} completed={completed} onComplete={onComplete} />
    </div>
  );
}

type Month = 'January' | 'February' | 'March' | 'April';
type Region = 'North' | 'South' | 'West';
type Category = 'Apparel' | 'Home';
const months: Month[] = ['January', 'February', 'March', 'April'];
const regions: Region[] = ['North', 'South', 'West'];
const categories: Category[] = ['Apparel', 'Home'];

function cellFacts(month: Month, region: Region, category: Category) {
  return factRows.filter((fact) => fact.month === month && fact.region === region && fact.category === category);
}

function CubeExplorer({ onComplete, completed }: ChapterLabProps) {
  const [month, setMonth] = useState<Month>('February');
  const [region, setRegion] = useState<Region>('North');
  const [category, setCategory] = useState<Category>('Home');
  const facts = cellFacts(month, region, category);
  const value = facts.reduce((sum, fact) => sum + fact.net, 0);
  const [sawMissing, setSawMissing] = useState(false);
  const [populatedCoordinates, setPopulatedCoordinates] = useState<string[]>([]);
  const ready = sawMissing && populatedCoordinates.length >= 3;
  return (
    <div className="lab-stack cube-lab-layout">
      <div className="mentor-sketch"><span>Mira</span><p className="hand-copy">A blank cell is not automatically zero.</p></div>
      <fieldset className="month-picker">
        <legend>Choose a month layer</legend>
        <div>{months.map((item) => <button type="button" key={item} aria-pressed={month === item} onClick={() => setMonth(item)}>{item.slice(0, 3)}</button>)}</div>
      </fieldset>
      <div className="matrix-wrap">
        <table className="cube-matrix">
          <caption>Net sales by Region × Category for {month}</caption>
          <thead><tr><th>Region</th>{categories.map((item) => <th key={item} className="hand-copy">{item}</th>)}</tr></thead>
          <tbody>{regions.map((rowRegion) => <tr key={rowRegion}><th className="hand-copy">{rowRegion}</th>{categories.map((columnCategory) => {
            const rows = cellFacts(month, rowRegion, columnCategory);
            const cellValue = rows.reduce((sum, fact) => sum + fact.net, 0);
            const selected = rowRegion === region && columnCategory === category;
            return <td key={columnCategory}><button type="button" className={`cube-cell ${selected ? 'selected-cell' : ''} ${rows.length ? '' : 'empty-cell'}`} aria-pressed={selected} onClick={() => {
              setRegion(rowRegion); setCategory(columnCategory);
              if (rows.length === 0) setSawMissing(true);
              if (rows.length > 0) {
                const coordinate = `${month}|${rowRegion}|${columnCategory}`;
                setPopulatedCoordinates((current) => current.includes(coordinate) ? current : [...current, coordinate]);
              }
            }}><strong>{rows.length ? money(cellValue) : '—'}</strong><span>{rows.length ? `${rows.length} fact row${rows.length > 1 ? 's' : ''}` : 'No matching fact'}</span></button></td>;
          })}</tr>)}</tbody>
        </table>
      </div>
      <div className="coordinate-strip" role="status" aria-live="polite"><code>[{month}, {region}, {category}]</code><span>→</span><strong className="hand-value">{facts.length ? money(value) : '—'}</strong></div>
      <div className="drill-panel">
        <h4>Contributing fact rows</h4>
        {facts.length ? facts.map((fact) => <div className="fact-row" key={`${fact.order}-${fact.line}`}><span>Order {fact.order} · {fact.product}</span><code>{money(fact.net)}</code></div>) : <p>No completed fact row matches this coordinate.</p>}
      </div>
      <div className="task-checks" role="status" aria-live="polite">
        <span className={populatedCoordinates.length >= 3 ? 'done' : ''}>Populated cells inspected: {populatedCoordinates.length} / 3</span>
        <span className={sawMissing ? 'done' : ''}>Missing cell inspected {sawMissing ? '✓' : '○'}</span>
      </div>
      <p className="micro-task">Evidence goal: inspect three populated coordinates and one missing coordinate. Try changing the month layer.</p>
      <FinishButton ready={ready} completed={completed} onComplete={onComplete} />
    </div>
  );
}

function SqlBuilder({ onComplete, completed }: ChapterLabProps) {
  const correctOrder = ['SELECT', 'FROM + JOIN', 'WHERE', 'GROUP BY', 'HAVING', 'ORDER BY'];
  const [built, setBuilt] = useState<string[]>([]);
  const [ran, setRan] = useState(false);
  const isCorrect = built.length === correctOrder.length && built.every((item, index) => item === correctOrder[index]);
  function addClause(clause: string) {
    if (!built.includes(clause)) setBuilt((current) => [...current, clause]);
  }
  return (
    <div className="lab-stack">
      <div className="clause-bank">{correctOrder.map((clause) => <button type="button" key={clause} disabled={built.includes(clause)} onClick={() => addClause(clause)}>{clause}</button>)}</div>
      <div className="sql-construction">
        <ol>{built.map((clause, index) => <li key={clause}><span>{index + 1}</span><code>{clause}</code></li>)}</ol>
        {!built.length && <p>Choose clauses in the order SQL reads them.</p>}
      </div>
      <div className="button-row">
        <button type="button" className="quiet-button" onClick={() => { setBuilt([]); setRan(false); }}>Reset blocks</button>
        <button type="button" className="sketch-button" disabled={!isCorrect} onClick={() => setRan(true)}>Run grouped query</button>
      </div>
      {ran && <div className="result-strip"><span>February · North · Home</span><strong>{money(6600)}</strong></div>}
      {!isCorrect && built.length > 1 && <p className="mentor-feedback">Hint: choose what to display before naming the source tables.</p>}
      <FinishButton ready={ran} completed={completed} onComplete={onComplete} />
    </div>
  );
}

function FilterLab({ onComplete, completed }: ChapterLabProps) {
  const [selectedMonths, setSelectedMonths] = useState<Month[]>(['February']);
  const [selectedRegions, setSelectedRegions] = useState<Region[]>(regions);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>(categories);
  const [sliceDone, setSliceDone] = useState(false);
  const [diceDone, setDiceDone] = useState(false);
  const rows = factRows.filter((fact) => selectedMonths.includes(fact.month as Month) && selectedRegions.includes(fact.region) && selectedCategories.includes(fact.category));
  const total = rows.reduce((sum, fact) => sum + fact.net, 0);
  const hasEmptySelection = !selectedMonths.length || !selectedRegions.length || !selectedCategories.length;
  const generatedSql = hasEmptySelection
    ? `SELECT d.month_name, s.region, p.category, SUM(f.net_amount) AS net_sales\nFROM fact_sales AS f\nJOIN dim_date AS d ON d.date_key = f.date_key\nJOIN dim_store AS s ON s.store_key = f.store_key\nJOIN dim_product AS p ON p.product_key = f.product_key\nWHERE 1 = 0 -- Choose at least one member on every dimension.\nGROUP BY d.month_number, d.month_name, s.region, p.category\nORDER BY d.month_number, s.region, p.category;`
    : `SELECT d.month_name, s.region, p.category, SUM(f.net_amount) AS net_sales\nFROM fact_sales AS f\nJOIN dim_date AS d ON d.date_key = f.date_key\nJOIN dim_store AS s ON s.store_key = f.store_key\nJOIN dim_product AS p ON p.product_key = f.product_key\nWHERE d.month_name IN (${selectedMonths.map((item) => `'${item}'`).join(', ')})\n  AND s.region IN (${selectedRegions.map((item) => `'${item}'`).join(', ')})\n  AND p.category IN (${selectedCategories.map((item) => `'${item}'`).join(', ')})\nGROUP BY d.month_number, d.month_name, s.region, p.category\nORDER BY d.month_number, s.region, p.category;`;

  function toggle<T>(value: T, list: T[], setter: (values: T[]) => void) {
    setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  }

  function applySlice() {
    setSelectedMonths(['February']); setSelectedRegions(regions); setSelectedCategories(categories); setSliceDone(true);
  }
  function applyDice() {
    setSelectedMonths(['January', 'February']); setSelectedRegions(['South', 'West']); setSelectedCategories(['Apparel']); setDiceDone(true);
  }

  return (
    <div className="lab-stack">
      <div className="preset-row"><button type="button" className="sketch-button" onClick={applySlice}>Guided slice: February</button><button type="button" className="sketch-button" onClick={applyDice}>Guided dice: Jan–Feb · South/West · Apparel</button></div>
      <div className="filter-grid">
        <fieldset><legend>Months</legend>{months.map((item) => <label key={item}><input type="checkbox" checked={selectedMonths.includes(item)} onChange={() => toggle(item, selectedMonths, setSelectedMonths)} /> {item}</label>)}</fieldset>
        <fieldset><legend>Regions</legend>{regions.map((item) => <label key={item}><input type="checkbox" checked={selectedRegions.includes(item)} onChange={() => toggle(item, selectedRegions, setSelectedRegions)} /> {item}</label>)}</fieldset>
        <fieldset><legend>Categories</legend>{categories.map((item) => <label key={item}><input type="checkbox" checked={selectedCategories.includes(item)} onChange={() => toggle(item, selectedCategories, setSelectedCategories)} /> {item}</label>)}</fieldset>
      </div>
      <div className="result-strip" role="status" aria-live="polite"><span>{rows.length} matching fact rows</span><strong>{rows.length ? money(total) : '— no matching fact'}</strong></div>
      <pre className="generated-sql"><code>{generatedSql}</code></pre>
      <div className="task-checks"><span className={sliceDone ? 'done' : ''}>February slice → ₹9,900</span><span className={diceDone ? 'done' : ''}>Guided dice → ₹5,800</span></div>
      <FinishButton ready={sliceDone && diceDone} completed={completed} onComplete={onComplete} />
    </div>
  );
}

function HierarchyElevator({ onComplete, completed }: ChapterLabProps) {
  const [level, setLevel] = useState<'Year' | 'Quarter' | 'Month' | 'Day'>('Month');
  const [visited, setVisited] = useState<string[]>(['Month']);
  const [journey, setJourney] = useState<string[]>(['Month']);
  function visit(next: 'Year' | 'Quarter' | 'Month' | 'Day') {
    setLevel(next); setVisited((current) => current.includes(next) ? current : [...current, next]);
    setJourney((current) => [...current, next]);
  }
  const rows = level === 'Year'
    ? [['2026 loaded period', 19800]]
    : level === 'Quarter'
      ? [['Q1', 16300], ['Q2 through April', 3500]]
      : level === 'Month'
        ? [['January', 6400], ['February', 9900], ['March', null], ['April', 3500]]
        : [['2026-01-05', 2100], ['2026-01-12', 4300], ['2026-02-03', 3300], ['2026-02-14', 6600], ['2026-04-08', 3500]];
  return (
    <div className="lab-stack">
      <div className="elevator-control">{(['Year', 'Quarter', 'Month', 'Day'] as const).map((item) => <button type="button" key={item} aria-pressed={level === item} onClick={() => visit(item)}>{item}</button>)}</div>
      <div className="rollup-bars">{rows.map(([label, value]) => <div key={String(label)}><span>{label}</span><div className={value === null ? 'missing-bar' : ''} style={{ '--bar': value === null ? '5%' : `${Math.max(12, Number(value) / 198)}%` } as React.CSSProperties}><strong>{value === null ? '— no facts' : money(Number(value))}</strong></div></div>)}</div>
      <div className="conservation-meter"><span>Total conservation</span><strong>₹19,800 ✓</strong></div>
      <p className="mentor-feedback">Q1 contains January, February, and March. March is a valid member even though this dataset has no March facts.</p>
      <div className="task-checks" role="status" aria-live="polite"><span className={visited.length === 4 ? 'done' : ''}>Levels visited: {visited.length} / 4</span><span className={journey.join('>').includes('Month>Quarter>Month') ? 'done' : ''}>Month → Quarter → Month {journey.join('>').includes('Month>Quarter>Month') ? '✓' : '○'}</span></div>
      <FinishButton ready={visited.length === 4 && journey.join('>').includes('Month>Quarter>Month')} completed={completed} onComplete={onComplete} />
    </div>
  );
}

function PivotDrillthrough({ onComplete, completed }: ChapterLabProps) {
  const [pivoted, setPivoted] = useState(false);
  const [hasPivoted, setHasPivoted] = useState(false);
  const [drilled, setDrilled] = useState(false);
  const [totalVerified, setTotalVerified] = useState(false);
  const drillRef = useRef<HTMLDivElement>(null);
  const monthLabels: Month[] = ['January', 'February', 'March', 'April'];
  function total(month: Month, region: Region) {
    const rows = factRows.filter((fact) => fact.month === month && fact.region === region && fact.category === 'Home');
    return rows.length ? rows.reduce((sum, fact) => sum + fact.net, 0) : null;
  }
  const rowLabels = pivoted ? regions : monthLabels;
  const columnLabels = pivoted ? monthLabels : regions;
  const displayedGrandTotal = monthLabels.reduce((sum, itemMonth) => sum + regions.reduce((regionSum, itemRegion) => regionSum + (total(itemMonth, itemRegion) ?? 0), 0), 0);
  useEffect(() => {
    if (drilled) drillRef.current?.focus();
  }, [drilled]);
  return (
    <div className="lab-stack">
      <div className="button-row"><span className="filter-chip">Category = Home</span><button type="button" className="sketch-button" onClick={() => { setPivoted((value) => !value); setHasPivoted(true); }}>↻ Pivot axes</button></div>
      <div className="table-scroll"><table className="data-table pivot-table"><caption>Home net sales; pivot changes presentation only</caption><thead><tr><th>{pivoted ? 'Region ↓ / Month →' : 'Month ↓ / Region →'}</th>{columnLabels.map((label) => <th key={label}>{label}</th>)}</tr></thead><tbody>{rowLabels.map((row) => <tr key={row}><th>{row}</th>{columnLabels.map((column) => {
        const month = (pivoted ? column : row) as Month;
        const region = (pivoted ? row : column) as Region;
        const value = total(month, region);
        const anchor = month === 'February' && region === 'North';
        return <td key={column}>{anchor
          ? <button type="button" className="anchor-cell" aria-label="Drill through February, North, Home net sales of ₹6,600" onClick={() => setDrilled(true)}>{money(6600)}</button>
          : <span className="pivot-value">{value === null ? '—' : money(value)}</span>}</td>;
      })}</tr>)}</tbody></table></div>
      <div className="conservation-meter"><span>Home grand total in this orientation</span><strong>{money(displayedGrandTotal)}</strong></div>
      <button type="button" className="sketch-button" disabled={!hasPivoted} onClick={() => setTotalVerified(displayedGrandTotal === 13500)}>Verify pre-pivot ₹13,500 = post-pivot total</button>
      {totalVerified && <p className="success-callout" role="status" aria-live="polite">Verified: pivot changed the axes, while the Home grand total stayed ₹13,500.</p>}
      {drilled ? <div className="drill-panel" ref={drillRef} tabIndex={-1} role="status" aria-live="polite"><h4>February × North × Home</h4><div className="fact-row"><span>Order 1004 · Kettle</span><code>₹3,600</code></div><div className="fact-row"><span>Order 1004 · Lamp</span><code>₹3,000</code></div><div className="reconcile-box"><span>SUM</span><strong>₹6,600</strong></div></div> : <p className="micro-task">Select the outlined ₹6,600 cell to drill through.</p>}
      <FinishButton ready={hasPivoted && drilled && totalVerified} completed={completed} onComplete={onComplete} />
    </div>
  );
}

function GroupingSetGenerator({ onComplete, completed }: ChapterLabProps) {
  const dimensions = ['Month', 'Region', 'Category'];
  const [detail, setDetail] = useState<string[]>(dimensions);
  const [ranCube, setRanCube] = useState(false);
  const [operator, setOperator] = useState<'CUBE' | 'ROLLUP' | 'GROUPING SETS'>('CUBE');
  const [operatorsVisited, setOperatorsVisited] = useState<string[]>([]);
  const [classifications, setClassifications] = useState<Record<string, string>>({});
  const patterns = [
    { label: 'Month + Region + Category', flags: '0 · 0 · 0', answer: 'Detail' },
    { label: 'Month + Region', flags: '0 · 0 · 1', answer: 'Subtotal' },
    { label: 'Month + Category', flags: '0 · 1 · 0', answer: 'Subtotal' },
    { label: 'Region + Category', flags: '1 · 0 · 0', answer: 'Subtotal' },
    { label: 'Month only', flags: '0 · 1 · 1', answer: 'Subtotal' },
    { label: 'Region only', flags: '1 · 0 · 1', answer: 'Subtotal' },
    { label: 'Category only', flags: '1 · 1 · 0', answer: 'Subtotal' },
    { label: 'No dimensions', flags: '1 · 1 · 1', answer: 'Grand total' },
  ];
  const solved = patterns.filter((pattern) => classifications[pattern.label] === pattern.answer).length;
  const operatorDetails = {
    CUBE: {
      code: 'GROUP BY CUBE (Month, Region, Category)',
      text: 'Every dimension may be kept or rolled up, so three dimensions create 2³ = 8 grouping patterns.',
    },
    ROLLUP: {
      code: 'GROUP BY ROLLUP (Month, Region, Category)',
      text: 'ROLLUP removes suffixes in order: (Month, Region, Category) → (Month, Region) → (Month) → (). These are hierarchical prefixes.',
    },
    'GROUPING SETS': {
      code: 'GROUP BY GROUPING SETS ((Month, Region, Category), (Month), (Region), ())',
      text: 'GROUPING SETS returns only the explicitly named detail and subtotal levels.',
    },
  } as const;
  function visitOperator(next: 'CUBE' | 'ROLLUP' | 'GROUPING SETS') {
    setOperator(next);
    setOperatorsVisited((current) => current.includes(next) ? current : [...current, next]);
  }
  return (
    <div className="lab-stack">
      <fieldset className="dimension-toggles"><legend>Build one grouping set</legend>{dimensions.map((item) => <label key={item}><input type="checkbox" checked={detail.includes(item)} onChange={() => setDetail((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item])} /> {item}</label>)}</fieldset>
      <div className="grouping-preview"><span>Current grouping</span><strong>{detail.length ? detail.join(' + ') : 'Grand total'}</strong><code>{detail.length ? `GROUP BY ${detail.join(', ')}` : 'GROUP BY ()'}</code></div>
      <button type="button" className="sketch-button" onClick={() => { setRanCube(true); visitOperator('CUBE'); }}>Generate full 3-dimension CUBE</button>
      {ranCube && <div className="pattern-grid">{patterns.map((pattern, index) => <div key={pattern.label}><span>{index + 1}</span><strong>{pattern.label}</strong><small>GROUPING flags: {pattern.flags}</small><select aria-label={`Classify ${pattern.label}`} value={classifications[pattern.label] ?? ''} onChange={(event) => setClassifications((current) => ({ ...current, [pattern.label]: event.target.value }))}><option value="">Classify…</option><option>Detail</option><option>Subtotal</option><option>Grand total</option></select></div>)}</div>}
      <section className="operator-compare"><h4 className="hand-heading">Compare the three subtotal operators</h4><div className="segmented-control" role="group" aria-label="Choose a subtotal operator">{(['CUBE', 'ROLLUP', 'GROUPING SETS'] as const).map((item) => <button type="button" key={item} aria-pressed={operator === item} onClick={() => visitOperator(item)}>{item}</button>)}</div><div role="status" aria-live="polite"><code>{operatorDetails[operator].code}</code><p>{operatorDetails[operator].text}</p><small>SQLite has no native CUBE, ROLLUP, or GROUPING SETS; emulate each requested level with grouped SELECT statements joined by UNION ALL.</small></div></section>
      <div className="result-strip" role="status" aria-live="polite"><span>Patterns classified correctly</span><strong>{ranCube ? `${solved} / 8 · 2³ total` : '—'}</strong></div>
      <div className="task-checks" role="status" aria-live="polite"><span className={solved === 8 ? 'done' : ''}>Eight CUBE patterns {solved === 8 ? '✓' : '○'}</span><span className={operatorsVisited.length === 3 ? 'done' : ''}>CUBE, ROLLUP, GROUPING SETS compared: {operatorsVisited.length} / 3</span></div>
      <FinishButton ready={ranCube && solved === 8 && operatorsVisited.length === 3} completed={completed} onComplete={onComplete} />
    </div>
  );
}

function ErrorClinic({ onComplete, completed }: ChapterLabProps) {
  const cases = [
    { title: 'Net sales became ₹25,800', cause: 'Cancelled order included', fixes: ['Add status = completed to the fact load', 'Round the total', 'Change SUM to AVG'], correct: 0 },
    { title: 'One fact appeared twice', cause: 'Duplicate dimension join', fixes: ['Drop the fact', 'Enforce one dimension match for the business key/as-of date', 'Display fewer columns'], correct: 1 },
    { title: 'Blank cell displayed as ₹0', cause: 'Silent zero-fill', fixes: ['Keep NULL/blank until a semantic zero-fill rule is stated', 'Delete the dimension member', 'Add a random fact'], correct: 0 },
    { title: 'Average order value looks too high', cause: 'Average of store averages', fixes: ['Average the displayed averages again', 'Recalculate as SUM(net sales) ÷ COUNT(DISTINCT order_id)', 'Remove low-volume stores'], correct: 1 },
  ];
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const solved = cases.filter((item, index) => answers[index] === item.correct).length;
  return (
    <div className="lab-stack"><div className="clinic-grid">{cases.map((item, index) => <article key={item.title} className={answers[index] === item.correct ? 'solved-case' : ''}><span className="alarm-label">Alarm {index + 1}</span><h4 id={`alarm-${index}-title`}>{item.title}</h4><p>{item.cause}</p><div role="group" aria-labelledby={`alarm-${index}-title`}>{item.fixes.map((fix, fixIndex) => <button type="button" key={fix} aria-pressed={answers[index] === fixIndex} onClick={() => setAnswers((current) => ({ ...current, [index]: fixIndex }))}>{fix}</button>)}</div>{answers[index] !== undefined && <small className={answers[index] === item.correct ? 'good-text' : 'warn-text'} role="status" aria-live="polite">{answers[index] === item.correct ? 'Repair accepted.' : 'That does not remove the cause.'}</small>}</article>)}</div><div className="reconciliation-board"><div><span>Facts</span><strong>{solved === 4 ? '10 ✓' : 'check'}</strong></div><div><span>Gross − discounts</span><strong>{solved === 4 ? '₹19,800 ✓' : 'check'}</strong></div><div><span>Cancelled net</span><strong>{solved === 4 ? 'excluded ✓' : 'check'}</strong></div></div><FinishButton ready={solved === 4} completed={completed} onComplete={onComplete} /></div>
  );
}

function EngineSimulator({ onComplete, completed }: ChapterLabProps) {
  const presets = [
    { id: 'fresh', name: 'Live analyst exploration', size: 3, freshness: 5, speed: 3, detail: 5 },
    { id: 'board', name: 'Repeated board dashboard', size: 4, freshness: 2, speed: 5, detail: 2 },
    { id: 'mixed', name: 'Fast summaries with audit detail', size: 5, freshness: 3, speed: 4, detail: 5 },
  ];
  const [size, setSize] = useState(3);
  const [freshness, setFreshness] = useState(5);
  const [speed, setSpeed] = useState(3);
  const [detail, setDetail] = useState(5);
  const [tried, setTried] = useState<string[]>([]);
  const recommendation = detail >= 4 && speed >= 4 && size >= 4 ? 'HOLAP' : speed >= 5 && freshness <= 3 && detail <= 3 ? 'MOLAP' : 'ROLAP';
  function applyPreset(preset: typeof presets[number]) {
    setSize(preset.size); setFreshness(preset.freshness); setSpeed(preset.speed); setDetail(preset.detail);
    setTried((current) => current.includes(preset.id) ? current : [...current, preset.id]);
  }
  return (
    <div className="lab-stack"><div className="preset-row">{presets.map((preset) => <button type="button" key={preset.id} onClick={() => applyPreset(preset)}>{preset.name}</button>)}</div><div className="slider-grid"><label>Data size <strong>{size}/5</strong><input type="range" min="1" max="5" value={size} onChange={(event) => setSize(Number(event.target.value))} /></label><label>Freshness need <strong>{freshness}/5</strong><input type="range" min="1" max="5" value={freshness} onChange={(event) => setFreshness(Number(event.target.value))} /></label><label>Query speed need <strong>{speed}/5</strong><input type="range" min="1" max="5" value={speed} onChange={(event) => setSpeed(Number(event.target.value))} /></label><label>Drill-through detail <strong>{detail}/5</strong><input type="range" min="1" max="5" value={detail} onChange={(event) => setDetail(Number(event.target.value))} /></label></div><div className="engine-result" role="status" aria-live="polite"><span>Suggested starting point</span><strong className="hand-display">{recommendation}</strong><p>{recommendation === 'ROLAP' ? 'Query relational or columnar detail directly; freshness still depends on the ingestion cadence.' : recommendation === 'MOLAP' ? 'Prebuilt multidimensional structures favor repeated fast summaries.' : 'Hybrid summaries stay fast while relational facts remain available for audit.'}</p></div><div className="engine-cards"><div><strong>ROLAP</strong><small>Relational or columnar facts and dimensions</small></div><div><strong>MOLAP</strong><small>Multidimensional storage structures</small></div><div><strong>HOLAP</strong><small>Summary speed plus relational detail</small></div></div><FinishButton ready={tried.length === presets.length} completed={completed} onComplete={onComplete} /></div>
  );
}

function QualityControlRoom({ onComplete, completed }: ChapterLabProps) {
  const [controls, setControls] = useState<string[]>([]);
  const [ranChecks, setRanChecks] = useState(false);
  const performance = ['Date partition pruning', 'Monthly pre-aggregate', 'Columnar scan', 'Result cache'];
  const toggle = (value: string, list: string[], setter: (values: string[]) => void) => setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  const latency = Math.max(90, 820 - controls.length * 170);
  const totals = factRows.reduce((sum, fact) => ({
    units: sum.units + fact.quantity,
    gross: sum.gross + fact.gross,
    discounts: sum.discounts + fact.discount,
    net: sum.net + fact.net,
  }), { units: 0, gross: 0, discounts: 0, net: 0 });
  const uniqueGrain = new Set(factRows.map((fact) => `${fact.order}|${fact.line}`)).size === factRows.length;
  const completedOnly = factRows.every((fact) => rawOrders.find((order) => order.orderId === fact.order)?.status === 'completed') && !factRows.some((fact) => fact.order === 1006);
  const keysResolve = factRows.every((fact) => {
    const order = rawOrders.find((item) => item.orderId === fact.order);
    return Boolean(order
      && rawCustomers.some((customer) => customer.customerId === order.customerId)
      && rawStores.some((store) => store.storeId === order.storeId && store.storeName === fact.store)
      && rawProducts.some((product) => product.productName === fact.product && product.category === fact.category));
  });
  const trustChecks = [
    { label: 'Completed-only business rule', pass: completedOnly, evidence: 'Cancelled order 1006 is absent.' },
    { label: 'Unique fact grain', pass: uniqueGrain && factRows.length === 10, evidence: '10 unique (order_id, line_no) pairs.' },
    { label: 'Foreign keys resolve', pass: keysResolve, evidence: 'Every fact maps to an order, customer, store, and product.' },
    { label: 'Units reconcile', pass: totals.units === 14, evidence: `${totals.units} units; expected 14.` },
    { label: 'Gross sales reconcile', pass: totals.gross === 21150, evidence: `${money(totals.gross)}; expected ₹21,150.` },
    { label: 'Discounts reconcile', pass: totals.discounts === 1350, evidence: `${money(totals.discounts)}; expected ₹1,350.` },
    { label: 'Net sales reconcile', pass: totals.net === 19800 && totals.gross - totals.discounts === totals.net, evidence: `${money(totals.gross)} − ${money(totals.discounts)} = ${money(totals.net)}.` },
    { label: 'Freshness contract', pass: loadMetadata.loadedAt === '2026-04-30T06:00:00Z' && loadMetadata.dataThrough === '2026-04-30', evidence: `Loaded ${loadMetadata.loadedAt}; data through ${loadMetadata.dataThrough}.` },
  ];
  const allChecksPass = trustChecks.every((check) => check.pass);
  return (
    <div className="lab-stack"><div className="control-room-grid"><fieldset><legend>Performance controls</legend>{performance.map((item) => <label key={item}><input type="checkbox" checked={controls.includes(item)} onChange={() => toggle(item, controls, setControls)} /> {item}</label>)}</fieldset><fieldset><legend>Calculated trust gates</legend><p>These checks read the practice dataset. They are not self-certified checkboxes.</p><button type="button" className="sketch-button" onClick={() => setRanChecks(true)}>Run 8 data checks</button></fieldset></div><div className="telemetry-grid"><div><span>Simulated query time</span><strong>{latency} ms</strong></div><div><span>Fact rows</span><strong>{ranChecks ? `${factRows.length} ${factRows.length === 10 ? '✓' : '✕'}` : 'not run'}</strong></div><div><span>Net sales</span><strong>{ranChecks ? `${money(totals.net)} ${totals.net === 19800 ? '✓' : '✕'}` : 'not run'}</strong></div><div><span>Loaded at</span><strong>{ranChecks ? '2026-04-30 06:00 UTC ✓' : 'not run'}</strong></div></div>{ranChecks && <div className="quality-check-list" role="status" aria-live="polite">{trustChecks.map((check) => <article key={check.label} className={check.pass ? 'passed-check' : 'failed-check'}><strong>{check.pass ? '✓' : '✕'} {check.label}</strong><small>{check.evidence}</small></article>)}</div>}<p className="mentor-feedback">Performance controls change the simulated latency. Trust gates are calculated from rows, keys, totals, and the explicit ETL metadata record.</p><FinishButton ready={controls.length > 0 && ranChecks && allChecksPass} completed={completed} onComplete={onComplete} /></div>
  );
}

function DecisionBriefBuilder({ onComplete, completed, savedBrief, onBriefSave }: ChapterLabProps) {
  const [claim, setClaim] = useState(savedBrief?.claim ?? '');
  const [query, setQuery] = useState(savedBrief?.query ?? '');
  const [evidence, setEvidence] = useState(savedBrief?.evidence ?? '');
  const [caveat, setCaveat] = useState(savedBrief?.caveat ?? '');
  const [action, setAction] = useState(savedBrief?.action ?? '');
  const ready = claim === 'feb-up' && query === 'q1-groups' && evidence === 'north-home' && caveat === 'coverage' && action === 'investigate';
  const brief = { claim, query, evidence, caveat, action };
  function submitBrief() {
    if (!ready) return;
    onBriefSave?.(brief);
    onComplete();
  }
  return (
    <div className="lab-stack"><div className="brief-builder"><label><span>1 · Claim</span><select value={claim} onChange={(event) => setClaim(event.target.value)}><option value="">Choose a supported claim…</option><option value="feb-up">February exceeded January by ₹3,500</option><option value="march-up">March was the strongest month</option><option value="cancelled">Cancelled orders drove growth</option></select></label><label><span>2 · Reproducible query</span><select value={query} onChange={(event) => setQuery(event.target.value)}><option value="">Choose the query that proves it…</option><option value="q1-groups">Group completed facts by Q1 month, region, and category</option><option value="raw-count">Count every raw row, including cancelled orders</option><option value="visual">Read the chart without querying the source</option></select></label><label><span>3 · Drill-through evidence</span><select value={evidence} onChange={(event) => setEvidence(event.target.value)}><option value="">Choose traceable evidence…</option><option value="north-home">North × Home contributed ₹6,600 from two facts</option><option value="guess">The chart looks higher</option><option value="cancelled">Order 1006 contributed ₹6,000</option></select></label><label><span>4 · Coverage caveat</span><select value={caveat} onChange={(event) => setCaveat(event.target.value)}><option value="">Choose the honest limit…</option><option value="coverage">March has no facts; Q2 is loaded only through April</option><option value="zero">March sales were measured as exactly zero</option><option value="none">No caveat is needed</option></select></label><label><span>5 · Recommendation</span><select value={action} onChange={(event) => setAction(event.target.value)}><option value="">Choose a careful next step…</option><option value="investigate">Investigate North Home demand while preserving audit detail</option><option value="all-in">Assume every future month will match February</option><option value="delete">Remove all missing cells</option></select></label></div><article className={`decision-paper ${ready ? 'ready-paper' : ''}`}><span className="eyebrow">Northstar Retail · Decision Brief</span><h4 className="hand-heading">What drove Q1 sales?</h4>{ready ? <><p><strong>Claim:</strong> February net sales were ₹9,900, ₹3,500 above January.</p><p><strong>Query:</strong> Completed facts grouped by Q1 month, region, and category.</p><p><strong>Evidence:</strong> February’s largest cell was North × Home at ₹6,600. Drill-through shows Kettle ₹3,600 and Lamp ₹3,000 from order 1004.</p><p><strong>Caveat:</strong> March has no loaded facts; Q2 is loaded only through April.</p><p><strong>Next step:</strong> Investigate North Home demand and preserve detail for audit.</p><div className="proof-grid"><span>All loaded net <strong>₹19,800</strong></span><span>Q1 net <strong>₹16,300</strong></span><span>Q1 regions <strong>N ₹6,600 · S ₹5,400 · W ₹4,300</strong></span><span>Q1 categories <strong>Apparel ₹5,800 · Home ₹10,500</strong></span></div></> : <p>Choose one defensible claim, query, evidence trail, coverage caveat, and careful action.</p>}</article><FinishButton ready={ready} completed={completed} onComplete={submitBrief} readyText="Submit and save the Decision Brief" /></div>
  );
}

function KnowledgeMap({ onComplete, completed, savedNextMission, onNextMissionSave }: ChapterLabProps) {
  const nodes = [
    ['Raw rows', 'Events are recorded with keys and business status.'],
    ['Grain', 'One fact means one completed order line.'],
    ['Star', 'Facts measure; dimensions describe.'],
    ['Measures', 'Sum additive parts; recalculate ratios.'],
    ['Cube', 'Coordinates plus an aggregate create a cell.'],
    ['Operations', 'Slice, dice, pivot, roll-up, drill-down, drill-through.'],
    ['Trust', 'Reconcile rules, rows, totals, freshness, and missingness.'],
    ['Decision', 'Connect a claim to reproducible evidence.'],
  ] as const;
  const shuffledNodes = [nodes[4], nodes[0], nodes[6], nodes[2], nodes[7], nodes[1], nodes[5], nodes[3]];
  const operations = [
    ['Slice', 'Fix one dimension to one member'], ['Dice', 'Keep a smaller set across several dimensions'],
    ['Pivot', 'Swap presentation axes'], ['Roll-up', 'Move toward a summary level'],
    ['Drill-down', 'Move toward a detailed hierarchy level'], ['Drill-through', 'Open contributing fact rows'],
    ['CUBE', 'Generate every subtotal combination across chosen dimensions'],
    ['GROUPING SETS', 'Request an explicit list of subtotal levels'],
  ] as const;
  const missions = [
    { id: 'sql-analyst', title: 'SQL Analyst', description: 'Go deeper into ranking, windows, query plans, and advanced grouping.', checklist: ['Write a window-function comparison', 'Inspect one EXPLAIN plan', 'Rebuild the Q1 query without hints'] },
    { id: 'dimensional-modeler', title: 'Dimensional Modeler', description: 'Design durable stars, slowly changing dimensions, and historical joins.', checklist: ['Model one new business process', 'Choose a fact grain', 'Design one type-2 dimension'] },
    { id: 'semantic-layer', title: 'BI and Semantic-Layer Builder', description: 'Create shared metrics, governed definitions, lineage, and safe exploration.', checklist: ['Define one governed measure', 'Document its dimensions', 'Add an ownership and lineage note'] },
    { id: 'data-engineer', title: 'Data Engineer', description: 'Build reliable loads, tests, freshness checks, and incremental fact pipelines.', checklist: ['Load a new raw table', 'Add grain and key tests', 'Publish a freshness contract'] },
    { id: 'olap-architecture', title: 'OLAP Performance and Architecture', description: 'Study columnar execution, caching, partitions, and pre-aggregation.', checklist: ['Compare two storage modes', 'Benchmark one grouped query', 'Design a refresh strategy'] },
  ] as const;
  const [sequence, setSequence] = useState<string[]>([]);
  const [operationAnswers, setOperationAnswers] = useState<Record<string, string>>({});
  const [mission, setMission] = useState(savedNextMission ?? '');
  const [missionChecks, setMissionChecks] = useState<string[]>([]);
  const sequenceCorrect = sequence.length === nodes.length && sequence.every((item, index) => item === nodes[index][0]);
  const operationsCorrect = operations.every(([operation, definition]) => operationAnswers[operation] === definition);
  const selectedMission = missions.find((item) => item.id === mission);
  const checklistComplete = Boolean(selectedMission && selectedMission.checklist.every((item) => missionChecks.includes(item)));
  return (
    <div className="lab-stack">
      <section>
        <h4 className="hand-heading">1 · Rebuild the evidence path</h4>
        <p>Choose the eight stages in the order a trustworthy analysis is built.</p>
        <div className="knowledge-map">{shuffledNodes.map(([title, description]) => <button type="button" key={title} disabled={sequence.includes(title)} onClick={() => setSequence((current) => [...current, title])}><span>{sequence.indexOf(title) >= 0 ? sequence.indexOf(title) + 1 : '?'}</span><strong className="hand-copy">{title}</strong><small>{description}</small></button>)}</div>
        <div className="button-row"><button type="button" className="quiet-button" onClick={() => setSequence([])}>Reset sequence</button><span className={sequenceCorrect ? 'good-text' : sequence.length === nodes.length ? 'warn-text' : ''} role="status">{sequenceCorrect ? 'Correct path ✓' : sequence.length === nodes.length ? 'That path skips a dependency. Reset and retry.' : `${sequence.length} / 8 placed`}</span></div>
      </section>
      <section>
        <h4 className="hand-heading">2 · Match the eight core operations</h4>
        <div className="operation-match-grid">{operations.map(([operation]) => <label key={operation}><span>{operation}</span><select value={operationAnswers[operation] ?? ''} onChange={(event) => setOperationAnswers((current) => ({ ...current, [operation]: event.target.value }))}><option value="">Choose its meaning…</option>{operations.map(([, definition]) => <option key={definition}>{definition}</option>)}</select></label>)}</div>
      </section>
      <section>
        <h4 className="hand-heading">3 · Choose your next mission</h4>
        <div className="further-grid">{missions.map((item) => <button type="button" key={item.id} aria-pressed={mission === item.id} onClick={() => { setMission(item.id); setMissionChecks([]); onNextMissionSave?.(item.id); }}><span>Next path</span><strong>{item.title}</strong><p>{item.description}</p></button>)}</div>
        {selectedMission && <fieldset className="mission-checklist"><legend className="hand-heading">{selectedMission.title} · first mission checklist</legend>{selectedMission.checklist.map((item) => <label key={item}><input type="checkbox" checked={missionChecks.includes(item)} onChange={() => setMissionChecks((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item])} /> {item}</label>)}</fieldset>}
      </section>
      <div className="conclusion-note"><span className="eyebrow">Summary and conclusion</span><p className="hand-display">A cube is not magic. It is a trustworthy grouping of facts by meaningful business coordinates.</p></div>
      <section className="course-resources" aria-labelledby="course-resources-title">
        <div className="resource-heading">
          <div>
            <span className="eyebrow">Referenced sources · concise reading list</span>
            <h4 id="course-resources-title" className="hand-heading">References and further resources</h4>
          </div>
          <p>Five primary or authoritative sources for the ideas and SQL used in this course.</p>
        </div>
        <div className="resource-links">
          {learningResources.map((resource, index) => (
            <a key={resource.href} href={resource.href} target="_blank" rel="noreferrer">
              <span className="resource-source">{String(index + 1).padStart(2, '0')} · {resource.source}</span>
              <strong>{resource.title}</strong>
              <small>{resource.description}</small>
              <span className="sr-only">Opens in a new tab.</span>
              <b aria-hidden="true">Open ↗</b>
            </a>
          ))}
        </div>
      </section>
      <div className="task-checks" role="status" aria-live="polite"><span className={sequenceCorrect ? 'done' : ''}>Evidence path {sequenceCorrect ? '✓' : '○'}</span><span className={operationsCorrect ? 'done' : ''}>Operations matched {operationsCorrect ? '✓' : '○'}</span><span className={checklistComplete ? 'done' : ''}>Next-mission checklist {checklistComplete ? '✓' : '○'}</span></div>
      <FinishButton ready={sequenceCorrect && operationsCorrect && checklistComplete} completed={completed} onComplete={onComplete} readyText="Complete the 17-chapter journey" />
    </div>
  );
}
