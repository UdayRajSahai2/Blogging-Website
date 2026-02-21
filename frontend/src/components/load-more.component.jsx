const LoadMoreDataBtn = ({ state, fetchDataFun, additionalParam = {} }) => {
  if (!state) return null;

  const { totalDocs = 0, results = [], page = 1 } = state;

  if (results.length >= totalDocs) return null;

  return (
    <button
      onClick={() =>
        fetchDataFun({
          ...additionalParam,
          page: page + 1,
        })
      }
      className="text-dark-grey p-2 px-3 hover:bg-grey/30 
                 rounded-md flex items-center gap-2"
    >
      Load More
    </button>
  );
};

export default LoadMoreDataBtn;
