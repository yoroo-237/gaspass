import axios from 'axios';

const TELEGRAM_BOT_TOKEN = '8056218558:AAGAWbRg3_iqiIM7jMZXgUucy-TW5-ph5D0';
const TELEGRAM_CHAT_ID = '7994851990';

const escapeHtml = (text: string): string =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const formatOrderDetails = (
  cart: any[],
  total: number,
  name: string,
  phone: string,
  teid: string
): string => {
  const items = cart
    .map((item) =>
      `• ${escapeHtml(item.name)} (x${item.quantity || 1}) – $${(
        item.price * (item.quantity || 1)
      ).toFixed(2)}`
    )
    .join('\n');

  return `
<b>🧾 New command 🧾</b>\n
<b>👤 Name</b> : ${escapeHtml(name)}\n
<b>📞 Phone</b> : ${escapeHtml(phone)}\n
<b>🔍 Telegram id</b> : ${escapeHtml(teid)}\n
<b>📦 Articles</b> :\n${items}\n
<b>💰 Total</b> : $${total.toFixed(2)}
`.trim();
};

const sendCheckoutInfo = async (
  cart: any[],
  total: number,
  name: string,
  phone: string,
  teid: string
): Promise<{ success: boolean; message: string }> => {
  const message = formatOrderDetails(cart, total, name, phone, teid);

  try {
    const response = await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }
    );

    if (response.data.ok) {
      return { success: true, message: 'Envoi réussi via Telegram' };
    } else {
      return { success: false, message: 'Erreur retournée par Telegram.' };
    }
  } catch (error: any) {
    console.error('Telegram API Error:', error.response?.data || error);
    return {
      success: false,
      message:
        error.response?.data?.description || "Erreur inconnue lors de l'envoi.",
    };
  }
};

export default sendCheckoutInfo;
