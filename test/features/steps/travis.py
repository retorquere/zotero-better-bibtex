# -*- coding: utf-8 -*-

from __future__ import absolute_import
from behave.formatter.plain import PlainFormatter
from behave.textutil import make_indentation
import textwrap

# -----------------------------------------------------------------------------
# CLASS: PlainFormatter
# -----------------------------------------------------------------------------
class TravisFormatter(PlainFormatter):
    """
    Provides a simple plain formatter without coloring/formatting.
    The formatter displays now also:

       * multi-line text (doc-strings)
       * table
       * tags (maybe)
    """
    name = "travis"
    description = "Very basic formatter with maximum compatibility but shortened line lengths for Travis"

    LINE_WIDTH = 125

    def result(self, step):
        """
        Process the result of a step (after step execution).

        :param step:   Step object with result to process.
        """
        step = self.steps.pop(0)
        indent = make_indentation(2 * self.indent_size)
        if self.show_aligned_keywords:
            # -- RIGHT-ALIGN KEYWORDS (max. keyword width: 6):
            text = u"%s%6s %s" % (indent, step.keyword, step.name)
        else:
            text = u"%s%s %s" % (indent, step.keyword, step.name)
        self.stream.write(textwrap.shorten(text, width=self.LINE_WIDTH - 30) + ' ')

        status_text = f'({step.status.name}'
        if self.show_timings:
            status_text += " in %0.3fs" % step.duration
        status_text += ')'

        unicode_errors = 0
        if step.error_message:
            try:
                self.stream.write(u"%s\n%s\n" % (status_text, step.error_message))
            except UnicodeError as e:
                unicode_errors += 1
                self.stream.write(u"%s\n" % status_text)
                self.stream.write(u"%s while writing error message: %s\n" % \
                                  (e.__class__.__name__, e))
                if self.RAISE_OUTPUT_ERRORS:
                    raise
        else:
            self.stream.write(u"%s\n" % status_text)

        if self.show_multiline:
            if step.text:
                try:
                    self.doc_string(step.text)
                except UnicodeError as e:
                    unicode_errors += 1
                    self.stream.write(u"%s while writing docstring: %s\n" % \
                                      (e.__class__.__name__, e))
                    if self.RAISE_OUTPUT_ERRORS:
                        raise
            if step.table:
                self.table(step.table)

