const POSITIONS = [8, 16, 24, 32];

// Bestämmelsens symbol: användningens färg, eller egenskapens mönster (prickmark, korsmark, ringprickad mark).
function Pattern({ monster }) {
  return POSITIONS.flatMap((x) =>
    POSITIONS.map((y) => {
      if (monster === "prickmark") {
        return (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={1.4} fill="#1f2933" />
        );
      }
      if (monster === "korsmark") {
        return (
          <path
            key={`${x}-${y}`}
            d={`M${x - 2.5} ${y}h5M${x} ${y - 2.5}v5`}
            stroke="#1f2933"
            strokeWidth={1}
            fill="none"
          />
        );
      }
      return (
        <circle
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          r={2.2}
          fill="none"
          stroke="#1f2933"
          strokeWidth={0.9}
        />
      );
    })
  );
}

function Swatch({ rule }) {
  const isUse = rule.kategori === "anvandning";
  return (
    <svg
      viewBox="0 0 40 40"
      width={40}
      height={40}
      aria-hidden="true"
      style={{ flex: "none" }}
    >
      <rect
        x={1}
        y={1}
        width={38}
        height={38}
        rx={8}
        fill={isUse ? rule.fyllfarg || "#f5f5f5" : "#fff"}
        stroke="#9aa5b1"
        strokeWidth={1.2}
      />
      {rule.monster && <Pattern monster={rule.monster} />}
      {!rule.monster && !isUse && (
        <path
          d="M12 28 L20 10 L28 28 Z"
          fill="none"
          stroke="#52606d"
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

export default Swatch;
