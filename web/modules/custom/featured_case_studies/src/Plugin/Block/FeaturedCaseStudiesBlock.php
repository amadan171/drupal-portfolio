<?php

namespace Drupal\featured_case_studies\Plugin\Block;

use Drupal\Core\Block\BlockBase;

/**
 * Provides a 'FeaturedCaseStudiesBlock' block.
 *
 * @Block(
 *   id = "featured_case_studies_block",
 *   admin_label = @Translation("Featured Case Studies")
 * )
 */
class FeaturedCaseStudiesBlock extends BlockBase {
  /**
   * {@inheritdoc}
   */
  public function build() {
    $items = [
      ['title' => 'Case A', 'category' => 'UX', 'read_time' => 3, 'image' => 'https://picsum.photos/640/360?1'],
      ['title' => 'Case B', 'category' => 'Performance', 'read_time' => 5, 'image' => 'https://picsum.photos/640/360?2'],
      ['title' => 'Case C', 'category' => 'Accessibility', 'read_time' => 4, 'image' => 'https://picsum.photos/640/360?3'],
    ];
    return [
      '#theme' => 'featured_case_studies',
      '#items' => $items,
      '#cache' => [
        'contexts' => ['url.path'],
        'max-age' => 3600,
      ],
    ];
  }
}
