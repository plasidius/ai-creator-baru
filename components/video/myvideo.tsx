export default function MyVideo({
  title,
}: {
  title: string;
}) {
  return (
    <div
      style={{
        flex: 1,
        background: "black",
        color: "white",
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: 80,
        fontWeight: "bold",
      }}
    >
      {title}
    </div>
  );
}