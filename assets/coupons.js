/* 5GTrip 本地原型优惠码。真实优惠规则须由服务端校验。 */
(function () {
  const coupons = [{ code: 'TRIP10', title: '演示 9 折券', percent: 10 }];
  function orders() {
    try {
      const value = JSON.parse(localStorage.getItem('5gtrip-orders') || '[]');
      return Array.isArray(value) ? value : [];
    } catch { return []; }
  }
  function quote(rawCode, subtotal, existingOrders = orders()) {
    const code = String(rawCode || '').trim().toUpperCase();
    const coupon = coupons.find(item => item.code === code);
    if (!coupon) return { valid: false, message: '优惠码无效，请核对后重试。' };
    if (existingOrders.some(order => order.couponCode === code)) {
      return { valid: false, message: '此演示优惠码已在当前浏览器使用。' };
    }
    const amount = Number(subtotal);
    if (!Number.isFinite(amount) || amount <= 0) return { valid: false, message: '当前套餐无法使用优惠码。' };
    return { valid: true, code, title: coupon.title, discount: Math.round(amount * coupon.percent) / 100 };
  }
  window.TripCoupons = { coupons, orders, quote };
}());
