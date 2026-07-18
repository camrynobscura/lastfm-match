// caps the shared-item list at `cap` (keeps a huge overlap browsable),
// then returns the currently visible page, whether there's more to
// reveal, and the max playcount across the whole capped pool (not just
// the visible page) -- so bars already on screen don't rescale as more
// rows get revealed.
export function getDisplayPage(items, visibleCount, cap = 100) {
  const displayed = items.slice(0, cap)
  const visible = displayed.slice(0, visibleCount)
  const hasMore = visibleCount < displayed.length
  const max =
    displayed.length === 0
      ? 0
      : Math.max(
          ...displayed.flatMap((item) => [item.playcountOne, item.playcountTwo]),
        )

  return { displayed, visible, hasMore, max }
}
