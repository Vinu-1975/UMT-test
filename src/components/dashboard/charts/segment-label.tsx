import { num } from "@/lib/format";

/**
 * Shared "smart segment label" renderers for stacked Recharts bars.
 *
 * Behaviour:
 *   - If the segment is big enough to fit the value comfortably, render
 *     the value inside, centered, in `insideFill` (white by default).
 *   - Otherwise pop the value out of the segment as a callout in the
 *     segment's own colour, with a short leader line back to it.
 *
 * Two variants:
 *   - `segmentLabelVertical`   — for vertical bar segments. Fit check is
 *     based on segment **height**; the callout slides to the right of
 *     the bar with a horizontal leader.
 *   - `segmentLabelHorizontal` — for horizontal bar segments. Fit check
 *     is based on segment **width**; the callout pops above the bar
 *     with an L-shaped leader.
 *
 * Used by RegionBars, RegionMonthly, MonthlyUsageTotal, ApplicationBars
 * so tiny segments (e.g. 16 sessions next to 3,340) stay readable
 * without overlapping their neighbours.
 */

type Opts = {
  /** Colour for the callout text + leader when the label pops out. */
  color: string;
  /** Text colour when the label fits inside the segment. Defaults to white. */
  insideFill?: string;
};

function normalise(opts: Opts | string): Required<Opts> {
  if (typeof opts === "string") return { color: opts, insideFill: "#ffffff" };
  return { color: opts.color, insideFill: opts.insideFill ?? "#ffffff" };
}

/** For vertical stacked bars (segment height drives the fit check). */
export function segmentLabelVertical(opts: Opts | string) {
  const { color, insideFill } = normalise(opts);
  return (props: any) => {
    const x = Number(props.x ?? 0);
    const y = Number(props.y ?? 0);
    const width = Number(props.width ?? 0);
    const height = Number(props.height ?? 0);
    const v = Number(props.value ?? 0);
    if (!v) return null;

    const text = num(v);

    if (height >= 14) {
      return (
        <text
          x={x + width / 2}
          y={y + height / 2}
          fill={insideFill}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={11}
          fontWeight={600}
          pointerEvents="none"
        >
          {text}
        </text>
      );
    }

    const anchorX = x + width;
    const anchorY = y + height / 2;
    const labelX = x + width + 10;
    return (
      <g pointerEvents="none">
        <path
          d={`M${anchorX},${anchorY} L${labelX - 3},${anchorY}`}
          fill="none"
          stroke={color}
          strokeWidth={1}
          strokeOpacity={0.75}
        />
        <text
          x={labelX}
          y={anchorY}
          fill={color}
          textAnchor="start"
          dominantBaseline="central"
          fontSize={11}
          fontWeight={700}
        >
          {text}
        </text>
      </g>
    );
  };
}

/** For horizontal stacked bars (segment width drives the fit check). */
export function segmentLabelHorizontal(opts: Opts | string) {
  const { color, insideFill } = normalise(opts);
  return (props: any) => {
    const x = Number(props.x ?? 0);
    const y = Number(props.y ?? 0);
    const width = Number(props.width ?? 0);
    const height = Number(props.height ?? 0);
    const v = Number(props.value ?? 0);
    if (!v) return null;

    const text = num(v);
    // ~6.6 px per char at 12 px font + a little padding.
    const approxTextWidth = text.length * 6.6 + 10;

    if (width >= approxTextWidth) {
      return (
        <text
          x={x + width / 2}
          y={y + height / 2}
          fill={insideFill}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={12}
          fontWeight={600}
          pointerEvents="none"
        >
          {text}
        </text>
      );
    }

    const anchorX = x + width / 2;
    const labelX = x + width + 6;
    const elbowY = y - 8;
    const labelY = y - 10;
    return (
      <g pointerEvents="none">
        <path
          d={`M${anchorX},${y} L${anchorX},${elbowY} L${labelX - 3},${elbowY}`}
          fill="none"
          stroke={color}
          strokeWidth={1}
          strokeOpacity={0.75}
        />
        <text
          x={labelX}
          y={labelY}
          fill={color}
          textAnchor="start"
          dominantBaseline="auto"
          fontSize={11}
          fontWeight={700}
        >
          {text}
        </text>
      </g>
    );
  };
}
