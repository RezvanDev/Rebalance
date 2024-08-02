const API_BASE_URL = 'https://b147-202-79-184-241.ngrok-free.app'; // Замените на URL вашего бэкенда

export const api = {
  async registerUser(telegramId: string, username: string) {
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ telegramId, username }),
    });
    return response.json();
  },

  async getUserBalance(telegramId: string) {
    const response = await fetch(`${API_BASE_URL}/users/${telegramId}`);
    const data = await response.json();
    return data.balance;
  },

  async updateUserBalance(telegramId: string, amount: number) {
    const response = await fetch(`${API_BASE_URL}/users/${telegramId}/balance`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount }),
    });
    return response.json();
  },

  async getTransactions(telegramId: string) {
    const response = await fetch(`${API_BASE_URL}/transactions/${telegramId}`);
    return response.json();
  },

  async addTransaction(telegramId: string, transaction: any) {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ telegramId, ...transaction }),
    });
    return response.json();
  },

  async getChannels(telegramId: string) {
    const response = await fetch(`${API_BASE_URL}/channels/${telegramId}`);
    return response.json();
  },

  async completeChannelTask(telegramId: string, channelId: number) {
    const response = await fetch(`${API_BASE_URL}/channels/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ telegramId, channelId }),
    });
    return response.json();
  },

  async getTokenTask(taskId: string) {
    const response = await fetch(`${API_BASE_URL}/token-tasks/${taskId}`);
    return response.json();
  },

  async completeTokenTask(telegramId: string, taskId: number) {
    const response = await fetch(`${API_BASE_URL}/token-tasks/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ telegramId, taskId }),
    });
    return response.json();
  },
};