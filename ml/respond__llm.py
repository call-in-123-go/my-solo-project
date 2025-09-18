import sys

def get_llm_response(text_input):
    return f"LLM responded: Your query was about '{text_input}'."

if __name__ == "__main__":
    if len(sys.argv) > 1:
        llm_response = get_llm_response(sys.argv[1])
        print(llm_response)
    else:
        print("Error: No text input provided.", file=sys.stderr)
        sys.exit(1)