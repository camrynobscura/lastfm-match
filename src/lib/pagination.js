// the visible page of shared items, whether more remain, and the max
// playcount across the *whole* list -- so bars already on screen don't
// rescale as more rows appear.
//
// uncapped: the API returns at most 500 items per user, and "see more"
// reveals a page at a time, so the DOM grows only as far as someone clicks.
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
