// returns the currently visible page of shared items, whether there's more
// to reveal, and the max playcount across the whole list (not just the
// visible page) -- so bars already on screen don't rescale as more rows get
// revealed.
//
// the list isn't capped: the API fetches at most 500 items per user, so the
// overlap can't exceed that, and "see more" reveals PAGE_SIZE rows at a
// time -- the DOM only grows as far as someone actually clicks.
export function getDisplayPage(items, visibleCount) {
  const visible = items.slice(0, visibleCount)
  const hasMore = visibleCount < items.length
  const max =
    items.length === 0
      ? 0
      : Math.max(
          ...items.flatMap((item) => [item.playcountOne, item.playcountTwo]),
        )

  return { visible, hasMore, max }
}
