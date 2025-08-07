// HTML
<div id="customDropdown">
  <select id="dropdown">
    <option value="Option1">Option 1</option>
    <option value="Option2">Option 2</option>
    <option value="Option3">Option 3</option>
  </select>
</div>

// CSS
<style>
  #customDropdown {
    background-color: #000000;
    border: 2px solid #000000;
    width: 200px;
    padding: 5px;
    border-radius: 4px;
  }

  #dropdown {
    width: 100%;
    background-color: #000000;
    color: #b41821;
    border: none;
    font-size: 14px;
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    padding: 5px;
    cursor: pointer;
  }

  #dropdown option {
    background-color: #000000;
    color: #b41821;
  }
</style>

// JavaScript (optional for interaction)
<script>
  // You can expose selected value to SAC if needed
  document.getElementById("dropdown").addEventListener("change", function() {
    const selectedValue = this.value;
    // You can use this value in your application logic
    console.log("Selected:", selectedValue);
  });
</script>
