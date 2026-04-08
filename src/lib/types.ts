export interface StyleProfile {
  tone: string
  sentence_length: string
  paragraph_style: string
  heading_style: string
  preferred_phrases: string[]
  forbidden_patterns: string[]
  reading_level: string
  cta_style: string
  formality: string
  expertise_level: string
  opening_style: string
  closing_style: string
  text_rhythm: string
  analyzed_at: string
  article_count?: number
}

export interface RulesProfile {
  hard_rules: string[]
  soft_rules: string[]
  forbidden_elements: string[]
  required_elements: string[]
  formatting_rules: string[]
  seo_rules: string[]
  length_rules: string[]
  style_constraints: string[]
  validation_rules: string[]
  extracted_at: string
}

export interface ArticleInput {
  title: string
  key_points: string
  target_length: string
  purpose: string
  target_audience: string
  additional_info: string
  supplementary_materials: string
}

export interface GeneratedArticle {
  title: string
  perex: string
  body: string
  conclusion: string
  cta: string
  seo_title: string
  meta_description: string
  generated_at: string
  is_rewrite?: boolean
}

export interface ValidationIssue {
  rule: string
  description: string
  location?: string
}

export interface ValidationResult {
  errors: ValidationIssue[]
  warnings: ValidationIssue[]
  compliance_score: number
  recommendations: string[]
  validated_at: string
}

export interface ArticleRecord {
  id: string
  input: ArticleInput
  draft: GeneratedArticle
  validation: ValidationResult
  final: GeneratedArticle
  created_at: string
}
