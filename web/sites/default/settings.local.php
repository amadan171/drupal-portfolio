<?php
// Dev-only: use writable temp dirs for caches.
$settings['file_public_path'] = 'sites/default/files';
$settings['file_temp_path']   = '/tmp';

// Put compiled container & twig caches into /tmp (avoids host FS perms).
$settings['php_storage']['container']['directory'] = '/tmp';
$settings['php_storage']['twig']['directory']      = '/tmp';

// Optional: disable Twig cache during dev (forces recompilation).
$settings['twig_debug'] = TRUE;
$settings['twig_cache'] = FALSE;
