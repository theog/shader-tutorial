# Chapter Generation Prompt

Use this prompt template when asking the AI to generate a new chapter's content.

---

## Prompt Template

```
You are building Chapter {{CHAPTER_NUM}} of a 2D shader tutorial.

Title: {{CHAPTER_TITLE}}
Topics to cover: {{TOPICS_LIST}}
Key GLSL concepts: {{KEY_CONCEPTS}}

Generate the following files:

1. **lesson.md** — A written lesson (1500-2500 words) that:
   - Opens with a real-world analogy or visual motivation
   - Explains each concept incrementally with inline GLSL code snippets
   - Includes at least 3 complete shader examples (progressively complex)
   - Has a "Key Takeaways" section at the end
   - References the interactive app for hands-on practice
   - Connects to the previous chapter and previews the next

2. **quiz.md** — A quiz with:
   - 3 multiple choice questions (test concept understanding)
   - 2 true/false questions (test common misconceptions)
   - 2 code challenges (write a small shader from scratch)
   - Hidden answers section

3. **App.jsx** — A React+WebGL interactive app that:
   - Uses the ShaderCanvas component from the template
   - Has at least 3 preset shader examples users can load
   - Includes a live code editor
   - Has relevant uniform sliders (e.g. frequency, amplitude, threshold)
   - Shows step-by-step progression of the chapter's concepts
   - Includes inline explanatory comments

4. **shaders/*.frag** — Individual .frag files for each example shader

Match the style of The Book of Shaders: conversational, visual, building intuition
before formalism. Every concept should be immediately demonstrable in the playground.

Previous chapter covered: {{PREV_CHAPTER_SUMMARY}}
Next chapter will cover: {{NEXT_CHAPTER_SUMMARY}}
```

---

## Variables Reference

| Variable | Description |
|----------|-------------|
| `{{CHAPTER_NUM}}` | Two-digit chapter number (01, 02, ...) |
| `{{CHAPTER_TITLE}}` | Human-readable title |
| `{{TOPICS_LIST}}` | Comma-separated list of topics from syllabus |
| `{{KEY_CONCEPTS}}` | GLSL functions/concepts to focus on |
| `{{PREV_CHAPTER_SUMMARY}}` | One-line summary of previous chapter |
| `{{NEXT_CHAPTER_SUMMARY}}` | One-line summary of next chapter |
| `{{APP_DESCRIPTION}}` | One-line description for the app header |

---

## Example Usage

```
You are building Chapter 05 of a 2D shader tutorial.

Title: Shapes — Lines, Circles, and Rectangles
Topics to cover: distance fields, rectangles via step(), circles via length(), 
                 lines via distance-to-line, combining shapes with boolean ops
Key GLSL concepts: length(), distance(), step(), SDF basics, min/max for boolean ops

Generate the following files:
...

Previous chapter covered: Color spaces (RGB, HSB), mixing, gradients, palette generation
Next chapter will cover: Signed Distance Functions in depth — smooth operations, anti-aliasing
```
