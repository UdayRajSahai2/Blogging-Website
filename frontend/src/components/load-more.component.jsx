const LoadMoreDataBtn = ({
  state,
  fetchDataFun,
  additionalParam = {},
  loading,
}) => {
  if (!state) return null;

  const { totalDocs = 0, results = [], page = 1 } = state;

  const hasMore = results.length < totalDocs;

  if (!hasMore) return null;

  return (
    <div className="flex justify-center mt-1 mb-0">
      <button
        disabled={loading}
        onClick={() =>
          fetchDataFun({
            ...additionalParam,
            page: page + 1,
          })
        }
        className="inline-flex items-center gap-1 px-2 py-[2px] text-xs text-dark-grey hover:bg-grey/30 rounded-md leading-none disabled:opacity-50"
      >
        {loading ? "Loading..." : "Load More"}
      </button>
    </div>
  );
};

export default LoadMoreDataBtn;
