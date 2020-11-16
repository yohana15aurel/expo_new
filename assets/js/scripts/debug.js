import { SETTINGS } from './constants';
import { storage, pubSub, user } from './services';

if (SETTINGS.IS_DEBUG) {
  window.user = user;
  window.storage = storage;
  window.pubSub = pubSub;
}
