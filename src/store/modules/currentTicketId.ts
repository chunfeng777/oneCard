import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useCurrentIdStore = defineStore('currentId', () => {
  const currentId = ref<number | null>(
    localStorage.getItem('currentId') ? Number(localStorage.getItem('currentId')) : null
  );

  function setCurrentId(id: number | null) {
    if (id !== null && !isNaN(id)) {
      currentId.value = id;
      localStorage.setItem('currentId', id.toString());
    } else {
      currentId.value = null;
      localStorage.removeItem('currentId');
    }
  }

  return { currentId, setCurrentId };
});
