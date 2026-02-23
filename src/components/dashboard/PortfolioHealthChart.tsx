import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from "recharts";
import type { RagStatus } from "@/types";

const RAG_COLORS: Record<RagStatus, string> = {
  Green: "hsl(142, 72%, 37%)",
  Amber: "hsl(25, 95%, 53%)",
  Red: "hsl(0, 72%, 51%)",
};

interface Props {
  counts: Record<RagStatus, number>;
  onSegmentClick: (status: RagStatus | null) => void;
  activeFilter: RagStatus | null;
}

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;
  return (
    <g>
      <text x={cx} y={cy - 8} textAnchor="middle" fill="hsl(224, 30%, 12%)" className="text-2xl font-bold" fontSize={28} fontWeight={700}>
        {value}
      </text>
      <text x={cx} y={cy + 16} textAnchor="middle" fill="hsl(220, 10%, 46%)" fontSize={13}>
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 2}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

export function PortfolioHealthChart({ counts, onSegmentClick, activeFilter }: Props) {
  const data = [
    { name: "Green", value: counts.Green, status: "Green" as RagStatus },
    { name: "Amber", value: counts.Amber, status: "Amber" as RagStatus },
    { name: "Red", value: counts.Red, status: "Red" as RagStatus },
  ].filter((d) => d.value > 0);

  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (activeFilter) {
      const idx = data.findIndex((d) => d.status === activeFilter);
      setActiveIndex(idx >= 0 ? idx : undefined);
    } else {
      setActiveIndex(undefined);
    }
  }, [activeFilter]);

  const handleClick = (_: any, index: number) => {
    const clicked = data[index].status;
    onSegmentClick(activeFilter === clicked ? null : clicked);
  };

  return (
    <div className="flex flex-col items-center">
      <h3 className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Portfolio Health</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={85}
            dataKey="value"
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => {
              if (!activeFilter) setActiveIndex(undefined);
            }}
            onClick={handleClick}
            className="cursor-pointer outline-none"
            stroke="hsl(0, 0%, 100%)"
            strokeWidth={3}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={RAG_COLORS[entry.status]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-1">
        {data.map((d) => (
          <button
            key={d.name}
            onClick={() => onSegmentClick(activeFilter === d.status ? null : d.status)}
            className={`flex items-center gap-1.5 text-xs font-medium transition-opacity ${
              activeFilter && activeFilter !== d.status ? "opacity-40" : "opacity-100"
            }`}
          >
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: RAG_COLORS[d.status] }}
            />
            {d.name} ({d.value})
          </button>
        ))}
      </div>
    </div>
  );
}
