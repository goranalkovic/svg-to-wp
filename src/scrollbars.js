import 'overlayscrollbars/css/OverlayScrollbars.css';
import OverlayScrollbars from 'overlayscrollbars';

document.addEventListener('DOMContentLoaded', () => {
    const scrollbar = OverlayScrollbars(document.body, {});
});

export function scrollbar(node, options = {}) {
    const scrollbar = OverlayScrollbars(node, options);

    return {
        update(newOptions) {
            scrollbar.options(newOptions);
        },

        destroy() {
            scrollbar.destroy();
        },
    };
}