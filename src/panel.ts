import '../core/src/ui/styles.css';
import { mountPanel } from '../core/src/ui/app.js';
import { chromePlatform } from './platform.js';

const root = document.getElementById('app');
if (root) mountPanel(root, chromePlatform);
