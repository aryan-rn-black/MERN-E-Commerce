import CartDrawer from './CartDrawer.jsx'
import WishlistDrawer from './WishlistDrawer.jsx'
import CategoriesDrawer from './CategoriesDrawer.jsx'
import UserDrawer from './UserDrawer.jsx'
import SearchDrawer from './SearchDrawer.jsx'
import NotificationsDrawer from './NotificationsDrawer.jsx'
import FiltersDrawer from './FiltersDrawer.jsx'
import { useApp } from '../../context/AppContext.jsx'

/**
 * Mounts every left drawer from the global state.
 * Drawers are all off-canvas on the left side, animated with the shared `Drawer` shell.
 */
export default function DrawerContainer() {
  const { drawers, closeDrawer, products } = useApp()
  return (
    <>
      <CategoriesDrawer
        open={drawers.categories}
        onClose={() => closeDrawer('categories')}
      />
      <CartDrawer
        open={drawers.cart}
        onClose={() => closeDrawer('cart')}
      />
      <WishlistDrawer
        open={drawers.wishlist}
        onClose={() => closeDrawer('wishlist')}
      />
      <UserDrawer
        open={drawers.user}
        onClose={() => closeDrawer('user')}
      />
      <SearchDrawer
        open={drawers.search}
        onClose={() => closeDrawer('search')}
        products={products}
      />
      <NotificationsDrawer
        open={drawers.notifications}
        onClose={() => closeDrawer('notifications')}
      />
      <FiltersDrawer
        open={drawers.filters}
        onClose={() => closeDrawer('filters')}
      />
    </>
  )
}
